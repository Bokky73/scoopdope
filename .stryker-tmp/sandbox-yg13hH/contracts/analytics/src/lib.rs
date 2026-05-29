#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, vec, Address, Env, Symbol, Vec,
};

// TTL thresholds (in ledgers)
const TTL_THRESHOLD: u32 = 100;
const TTL_EXTEND_TO: u32 = 500;

// =============================================================================
// Storage keys
// =============================================================================

#[contracttype]
pub enum DataKey {
    Admin,
    Progress(Address, Symbol),   // persistent: ProgressRecord
    StudentCourses(Address),     // persistent: Vec<Symbol> — secondary index
    TotalStudents,
    TotalCourses,
    CompletionStats,
    DailyStats(u64),
    WeeklyStats(u64),
    MonthlyStats(u64),
    TopPerformers,
    Milestone(Address, Symbol, u32), // (student, course, milestone_pct) → MilestoneRecord
    StudentMilestones(Address, Symbol), // (student, course) → Vec<u32> (achieved milestones)
}

// =============================================================================
// Types
// =============================================================================

#[contracttype]
#[derive(Clone)]
pub struct ProgressRecord {
    pub student: Address,
    pub course_id: Symbol,
    pub progress_pct: u32,
    pub completed: bool,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone)]
pub struct CompletionStats {
    pub total_completions: u32,
    pub avg_completion_rate: u32,
}

#[contracttype]
#[derive(Clone)]
pub struct TimeBasedStats {
    pub period: u64,
    pub completions: u32,
    pub avg_progress: u32,
}

#[contracttype]
#[derive(Clone)]
pub struct TopPerformer {
    pub student: Address,
    pub completion_count: u32,
    pub avg_progress: u32,
}

#[contracttype]
#[derive(Clone)]
pub struct MilestoneRecord {
    pub student: Address,
    pub course_id: Symbol,
    pub milestone_pct: u32,
    pub achieved_at: u64,
}

// =============================================================================
// Contract
// =============================================================================

#[contract]
pub struct AnalyticsContract;

#[contractimpl]
impl AnalyticsContract {
    // -------------------------------------------------------------------------
    // Admin
    // -------------------------------------------------------------------------

    pub fn initialize(env: Env, admin: Address) {
        assert!(
            !env.storage().instance().has(&DataKey::Admin),
            "Already initialized"
        );
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    pub fn set_admin(env: Env, new_admin: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &new_admin);
    }

    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }

    // -------------------------------------------------------------------------
    // Progress
    // -------------------------------------------------------------------------

    /// Record or update a student's course progress.
    /// Callable by the student themselves OR the admin.
    pub fn record_progress(
        env: Env,
        caller: Address,
        student: Address,
        course_id: Symbol,
        progress_pct: u32,
    ) {
        caller.require_auth();
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(
            caller == student || caller == admin,
            "Unauthorized: must be student or admin"
        );
        assert!(progress_pct <= 100, "Progress must be 0-100");

        let record = ProgressRecord {
            student: student.clone(),
            course_id: course_id.clone(),
            progress_pct,
            completed: progress_pct == 100,
            timestamp: env.ledger().timestamp(),
        };

        // Write progress record to persistent storage
        let progress_key = DataKey::Progress(student.clone(), course_id.clone());
        env.storage().persistent().set(&progress_key, &record);
        env.storage()
            .persistent()
            .extend_ttl(&progress_key, TTL_THRESHOLD, TTL_EXTEND_TO);

        // Update secondary index: student → [course_ids]
        let index_key = DataKey::StudentCourses(student.clone());
        let mut courses: Vec<Symbol> = env
            .storage()
            .persistent()
            .get(&index_key)
            .unwrap_or_else(|| vec![&env]);

        if !courses.contains(&course_id) {
            courses.push_back(course_id.clone());
            env.storage().persistent().set(&index_key, &courses);
        }
        env.storage()
            .persistent()
            .extend_ttl(&index_key, TTL_THRESHOLD, TTL_EXTEND_TO);

        // Check and record milestone achievements
        Self::check_milestones(&env, &student, &course_id, progress_pct);

        // Emit events
        env.events().publish(
            (symbol_short!("analytics"), symbol_short!("prog_upd")),
            (student.clone(), course_id.clone(), progress_pct),
        );
        if progress_pct == 100 {
            env.events().publish(
                (symbol_short!("analytics"), symbol_short!("completed")),
                (student, course_id),
            );
        }
    }

    /// Reset a student's progress for a specific course (admin only).
    pub fn reset_progress(env: Env, admin: Address, student: Address, course_id: Symbol) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "Only admin can reset progress");

        let progress_key = DataKey::Progress(student.clone(), course_id.clone());
        env.storage().persistent().remove(&progress_key);

        // Remove from secondary index
        let index_key = DataKey::StudentCourses(student.clone());
        if let Some(mut courses) = env
            .storage()
            .persistent()
            .get::<DataKey, Vec<Symbol>>(&index_key)
        {
            let pos = courses.iter().position(|c| c == course_id);
            if let Some(i) = pos {
                courses.remove(i as u32);
                env.storage().persistent().set(&index_key, &courses);
                env.storage()
                    .persistent()
                    .extend_ttl(&index_key, TTL_THRESHOLD, TTL_EXTEND_TO);
            }
        }
    }

    // -------------------------------------------------------------------------
    // Progress — read
    // -------------------------------------------------------------------------

    /// Get a student's progress for a specific course.
    pub fn get_progress(env: Env, student: Address, course_id: Symbol) -> Option<ProgressRecord> {
        let key = DataKey::Progress(student, course_id);
        let record = env.storage().persistent().get(&key)?;
        env.storage()
            .persistent()
            .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
        Some(record)
    }

    /// Get all progress records for a student via the secondary index.
    pub fn get_all_progress(env: Env, student: Address) -> Vec<ProgressRecord> {
        let index_key = DataKey::StudentCourses(student.clone());
        let courses: Vec<Symbol> = match env.storage().persistent().get(&index_key) {
            Some(c) => {
                env.storage()
                    .persistent()
                    .extend_ttl(&index_key, TTL_THRESHOLD, TTL_EXTEND_TO);
                c
            }
            None => return vec![&env],
        };

        let mut results = vec![&env];
        for course_id in courses.iter() {
            let key = DataKey::Progress(student.clone(), course_id.clone());
            if let Some(record) = env.storage().persistent().get::<DataKey, ProgressRecord>(&key) {
                env.storage()
                    .persistent()
                    .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
                results.push_back(record);
            }
        }
        results
    }

    // -------------------------------------------------------------------------
    // Milestones
    // -------------------------------------------------------------------------

    fn check_milestones(env: &Env, student: &Address, course_id: &Symbol, progress_pct: u32) {
        let milestones = vec![&env, 25, 50, 75, 100];
        let milestone_key = DataKey::StudentMilestones(student.clone(), course_id.clone());
        let mut achieved: Vec<u32> = env
            .storage()
            .persistent()
            .get(&milestone_key)
            .unwrap_or_else(|| vec![&env]);

        for milestone in milestones.iter() {
            if progress_pct >= milestone && !achieved.contains(&milestone) {
                achieved.push_back(milestone);
                let record = MilestoneRecord {
                    student: student.clone(),
                    course_id: course_id.clone(),
                    milestone_pct: milestone,
                    achieved_at: env.ledger().timestamp(),
                };
                let key = DataKey::Milestone(student.clone(), course_id.clone(), milestone);
                env.storage().persistent().set(&key, &record);
                env.storage()
                    .persistent()
                    .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);

                env.events().publish(
                    (symbol_short!("analytics"), symbol_short!("milestone")),
                    (student.clone(), course_id.clone(), milestone),
                );
            }
        }

        env.storage().persistent().set(&milestone_key, &achieved);
        env.storage()
            .persistent()
            .extend_ttl(&milestone_key, TTL_THRESHOLD, TTL_EXTEND_TO);
    }

    pub fn get_milestone(
        env: Env,
        student: Address,
        course_id: Symbol,
        milestone_pct: u32,
    ) -> Option<MilestoneRecord> {
        let key = DataKey::Milestone(student, course_id, milestone_pct);
        let record = env.storage().persistent().get(&key)?;
        env.storage()
            .persistent()
            .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
        Some(record)
    }

    pub fn get_achieved_milestones(env: Env, student: Address, course_id: Symbol) -> Vec<u32> {
        let key = DataKey::StudentMilestones(student, course_id);
        match env.storage().persistent().get(&key) {
            Some(milestones) => {
                env.storage()
                    .persistent()
                    .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
                milestones
            }
            None => vec![&env],
        }
    }

    // -------------------------------------------------------------------------
    // Analytics Aggregation
    // -------------------------------------------------------------------------

    pub fn get_total_students(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::TotalStudents)
            .unwrap_or(0)
    }

    pub fn get_total_courses(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::TotalCourses)
            .unwrap_or(0)
    }

    pub fn get_completion_stats(env: Env) -> CompletionStats {
        env.storage()
            .instance()
            .get(&DataKey::CompletionStats)
            .unwrap_or(CompletionStats {
                total_completions: 0,
                avg_completion_rate: 0,
            })
    }

    pub fn get_daily_stats(env: Env, day: u64) -> Option<TimeBasedStats> {
        env.storage()
            .instance()
            .get(&DataKey::DailyStats(day))
    }

    pub fn get_weekly_stats(env: Env, week: u64) -> Option<TimeBasedStats> {
        env.storage()
            .instance()
            .get(&DataKey::WeeklyStats(week))
    }

    pub fn get_monthly_stats(env: Env, month: u64) -> Option<TimeBasedStats> {
        env.storage()
            .instance()
            .get(&DataKey::MonthlyStats(month))
    }

    pub fn get_top_performers(env: Env, limit: u32) -> Vec<TopPerformer> {
        let performers: Vec<TopPerformer> = env
            .storage()
            .instance()
            .get(&DataKey::TopPerformers)
            .unwrap_or_else(|| vec![&env]);

        let mut result = vec![&env];
        for (i, performer) in performers.iter().enumerate() {
            if i >= limit as usize {
                break;
            }
            result.push_back(performer.clone());
        }
        result
    }

    pub fn update_aggregates(env: Env, admin: Address) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "Only admin can update aggregates");

        // Update completion stats
        let mut stats = CompletionStats {
            total_completions: 0,
            avg_completion_rate: 0,
        };

        // In production, this would iterate through all students and courses
        // For now, we store the aggregated values
        env.storage()
            .instance()
            .set(&DataKey::CompletionStats, &stats);

        env.events().publish(
            (symbol_short!("analytics"), symbol_short!("agg_upd")),
            stats.total_completions,
        );
    }

    // -------------------------------------------------------------------------
    // Event Filtering & Pagination
    // -------------------------------------------------------------------------

    /// Get completed courses for a student (filtered by completion status).
    pub fn get_completed_courses(env: Env, student: Address) -> Vec<ProgressRecord> {
        let all_progress = Self::get_all_progress(env, student);
        let mut completed = vec![&env];
        
        for record in all_progress.iter() {
            if record.completed {
                completed.push_back(record.clone());
            }
        }
        completed
    }

    /// Get in-progress courses for a student (filtered by completion status).
    pub fn get_in_progress_courses(env: Env, student: Address) -> Vec<ProgressRecord> {
        let all_progress = Self::get_all_progress(env, student);
        let mut in_progress = vec![&env];
        
        for record in all_progress.iter() {
            if !record.completed {
                in_progress.push_back(record.clone());
            }
        }
        in_progress
    }

    /// Get paginated progress records for a student.
    /// offset: starting index, limit: max records to return
    pub fn get_progress_paginated(
        env: Env,
        student: Address,
        offset: u32,
        limit: u32,
    ) -> Vec<ProgressRecord> {
        let all_progress = Self::get_all_progress(env, student);
        let mut result = vec![&env];
        
        let start = offset as usize;
        let end = (offset as usize + limit as usize).min(all_progress.len());
        
        if start < all_progress.len() {
            for i in start..end {
                result.push_back(all_progress.get(i as u32).unwrap().clone());
            }
        }
        result
    }

    /// Get progress records for a student filtered by minimum progress percentage.
    pub fn get_progress_above_threshold(
        env: Env,
        student: Address,
        min_progress_pct: u32,
    ) -> Vec<ProgressRecord> {
        assert!(min_progress_pct <= 100, "Threshold must be 0-100");
        let all_progress = Self::get_all_progress(env, student);
        let mut filtered = vec![&env];
        
        for record in all_progress.iter() {
            if record.progress_pct >= min_progress_pct {
                filtered.push_back(record.clone());
            }
        }
        filtered
    }

    /// Count total completed courses for a student.
    pub fn count_completed_courses(env: Env, student: Address) -> u32 {
        let completed = Self::get_completed_courses(env, student);
        completed.len() as u32
    }

    /// Get average progress across all courses for a student.
    pub fn get_average_progress(env: Env, student: Address) -> u32 {
        let all_progress = Self::get_all_progress(env, student);
        if all_progress.len() == 0 {
            return 0;
        }
        
        let mut total: u64 = 0;
        for record in all_progress.iter() {
            total += record.progress_pct as u64;
        }
        (total / all_progress.len() as u64) as u32
    }
}

// =============================================================================
// Tests
// =============================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Events, Ledger, LedgerInfo};
    use soroban_sdk::{FromVal, Symbol};

    fn setup() -> (soroban_sdk::Env, AnalyticsContractClient<'static>, Address, Address) {
        let env = soroban_sdk::Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, AnalyticsContract);
        let client = AnalyticsContractClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let student = Address::generate(&env);
        client.initialize(&admin);
        (env, client, admin, student)
    }

    fn set_ledger(env: &soroban_sdk::Env, sequence: u32) {
        env.ledger().set(LedgerInfo {
            sequence_number: sequence,
            timestamp: sequence as u64 * 5,
            protocol_version: 21,
            network_id: Default::default(),
            base_reserve: 10,
            min_temp_entry_ttl: 1000,
            min_persistent_entry_ttl: 1000,
            max_entry_ttl: 100_000,
        });
    }

    fn has_event(env: &soroban_sdk::Env, topic1: &str, topic2: &str) -> bool {
        let t1 = Symbol::new(env, topic1);
        let t2 = Symbol::new(env, topic2);
        env.events().all().iter().any(|e| {
            let topics = e.1;
            if topics.len() < 2 {
                return false;
            }
            let s0 = Symbol::from_val(env, &topics.get(0).unwrap());
            let s1 = Symbol::from_val(env, &topics.get(1).unwrap());
            s0 == t1 && s1 == t2
        })
    }

    // ============================================================================
    // Initialize & Admin Tests
    // ============================================================================

    #[test]
    fn test_initialize_sets_admin() {
        let (_, client, admin, _) = setup();
        assert_eq!(client.get_admin(), admin);
    }

    #[test]
    #[should_panic(expected = "Already initialized")]
    fn test_double_initialize_panics() {
        let (_, client, admin, _) = setup();
        client.initialize(&admin);
    }

    #[test]
    fn test_set_admin() {
        let (env, client, old_admin, _) = setup();
        let new_admin = Address::generate(&env);
        client.set_admin(&new_admin);
        assert_eq!(client.get_admin(), new_admin);
        assert_ne!(client.get_admin(), old_admin);
    }

    // ============================================================================
    // Record Progress Tests (Happy Path)
    // ============================================================================

    #[test]
    fn test_record_progress_0_percent() {
        let (_, client, _, student) = setup();
        let course = symbol_short!("RUST101");
        client.record_progress(&student, &student, &course, &0);
        let rec = client.get_progress(&student, &course).unwrap();
        assert_eq!(rec.progress_pct, 0);
        assert!(!rec.completed);
    }

    #[test]
    fn test_record_progress_50_percent() {
        let (_, client, _, student) = setup();
        let course = symbol_short!("RUST101");
        client.record_progress(&student, &student, &course, &50);
        let rec = client.get_progress(&student, &course).unwrap();
        assert_eq!(rec.progress_pct, 50);
        assert!(!rec.completed);
    }

    #[test]
    fn test_record_progress_100_percent() {
        let (_, client, _, student) = setup();
        let course = symbol_short!("RUST101");
        client.record_progress(&student, &student, &course, &100);
        let rec = client.get_progress(&student, &course).unwrap();
        assert_eq!(rec.progress_pct, 100);
        assert!(rec.completed);
    }

    // ============================================================================
    // Progress Validation Tests
    // ============================================================================

    #[test]
    #[should_panic(expected = "Progress must be 0-100")]
    fn test_progress_over_100_panics() {
        let (_, client, _, student) = setup();
        let course = symbol_short!("RUST101");
        client.record_progress(&student, &student, &course, &101);
    }

    #[test]
    #[should_panic(expected = "Progress must be 0-100")]
    fn test_progress_way_over_100_panics() {
        let (_, client, _, student) = setup();
        let course = symbol_short!("RUST101");
        client.record_progress(&student, &student, &course, &200);
    }

    // ============================================================================
    // Get Progress Tests
    // ============================================================================

    #[test]
    fn test_get_progress_returns_none_for_unknown_student() {
        let (env, client, _, _) = setup();
        let unknown = Address::generate(&env);
        let course = symbol_short!("RUST101");
        assert!(client.get_progress(&unknown, &course).is_none());
    }

    #[test]
    fn test_get_progress_returns_none_for_unknown_course() {
        let (_, client, _, student) = setup();
        let course = symbol_short!("UNKNOWN");
        assert!(client.get_progress(&student, &course).is_none());
    }

    #[test]
    fn test_get_progress_returns_recorded_data() {
        let (_, client, _, student) = setup();
        let course = symbol_short!("RUST101");
        client.record_progress(&student, &student, &course, &75);
        let rec = client.get_progress(&student, &course).unwrap();
        assert_eq!(rec.student, student);
        assert_eq!(rec.course_id, course);
        assert_eq!(rec.progress_pct, 75);
    }

    // ============================================================================
    // Completion Event Tests
    // ============================================================================

    #[test]
    fn test_completion_event_emitted_at_100() {
        let (env, client, _, student) = setup();
        let course = symbol_short!("RUST101");
        client.record_progress(&student, &student, &course, &100);
        assert!(has_event(&env, "analytics", "completed"));
    }

    #[test]
    fn test_completion_event_not_emitted_below_100() {
        let (env, client, _, student) = setup();
        let course = symbol_short!("RUST101");
        client.record_progress(&student, &student, &course, &99);
        assert!(!has_event(&env, "analytics", "completed"));
    }

    #[test]
    fn test_progress_updated_event_always_emitted() {
        let (env, client, _, student) = setup();
        let course = symbol_short!("RUST101");
        client.record_progress(&student, &student, &course, &50);
        assert!(has_event(&env, "analytics", "prog_upd"));
    }

    #[test]
    fn test_both_events_emitted_at_100() {
        let (env, client, _, student) = setup();
        let course = symbol_short!("RUST101");
        client.record_progress(&student, &student, &course, &100);
        assert!(has_event(&env, "analytics", "prog_upd"));
        assert!(has_event(&env, "analytics", "completed"));
    }

    // ============================================================================
    // Authorization Tests
    // ============================================================================

    #[test]
    fn test_student_can_record_own_progress() {
        let (_, client, _, student) = setup();
        let course = symbol_short!("RUST101");
        client.record_progress(&student, &student, &course, &75);
        let rec = client.get_progress(&student, &course).unwrap();
        assert_eq!(rec.progress_pct, 75);
    }

    #[test]
    fn test_admin_can_record_student_progress() {
        let (_, client, admin, student) = setup();
        let course = symbol_short!("RUST101");
        client.record_progress(&admin, &student, &course, &100);
        let rec = client.get_progress(&student, &course).unwrap();
        assert_eq!(rec.progress_pct, 100);
    }

    #[test]
    #[should_panic(expected = "Unauthorized: must be student or admin")]
    fn test_unauthorized_caller_rejected() {
        let (env, client, _, student) = setup();
        let rando = Address::generate(&env);
        let course = symbol_short!("RUST101");
        client.record_progress(&rando, &student, &course, &50);
    }

    #[test]
    #[should_panic(expected = "Unauthorized: must be student or admin")]
    fn test_third_party_cannot_record_for_other_student() {
        let (env, client, _, student) = setup();
        let other_student = Address::generate(&env);
        let rando = Address::generate(&env);
        let course = symbol_short!("RUST101");
        client.record_progress(&rando, &other_student, &course, &50);
    }

    // ============================================================================
    // Persistent Storage & TTL Tests
    // ============================================================================

    #[test]
    fn test_record_survives_ledger_advance() {
        let (env, client, _, student) = setup();
        let course = symbol_short!("RUST101");
        set_ledger(&env, 1);
        client.record_progress(&student, &student, &course, &60);
        set_ledger(&env, 400);
        let rec = client.get_progress(&student, &course).unwrap();
        assert_eq!(rec.progress_pct, 60);
    }

    // ============================================================================
    // Secondary Index Tests (get_all_progress)
    // ============================================================================

    #[test]
    fn test_get_all_progress_empty() {
        let (_, client, _, student) = setup();
        let all = client.get_all_progress(&student);
        assert_eq!(all.len(), 0);
    }

    #[test]
    fn test_get_all_progress_single_course() {
        let (_, client, _, student) = setup();
        let course = symbol_short!("RUST101");
        client.record_progress(&student, &student, &course, &80);
        let all = client.get_all_progress(&student);
        assert_eq!(all.len(), 1);
        assert_eq!(all.get(0).unwrap().progress_pct, 80);
    }

    #[test]
    fn test_get_all_progress_multiple_courses() {
        let (_, client, _, student) = setup();
        let c1 = symbol_short!("RUST101");
        let c2 = symbol_short!("SOL201");
        let c3 = symbol_short!("WEB301");
        client.record_progress(&student, &student, &c1, &100);
        client.record_progress(&student, &student, &c2, &50);
        client.record_progress(&student, &student, &c3, &25);
        let all = client.get_all_progress(&student);
        assert_eq!(all.len(), 3);
    }

    #[test]
    fn test_get_all_progress_no_duplicates_on_update() {
        let (_, client, _, student) = setup();
        let course = symbol_short!("RUST101");
        client.record_progress(&student, &student, &course, &50);
        client.record_progress(&student, &student, &course, &75);
        let all = client.get_all_progress(&student);
        assert_eq!(all.len(), 1);
        assert_eq!(all.get(0).unwrap().progress_pct, 75);
    }

    #[test]
    fn test_get_all_progress_isolated_per_student() {
        let (env, client, _, student) = setup();
        let other = Address::generate(&env);
        let course = symbol_short!("RUST101");
        client.record_progress(&student, &student, &course, &100);
        let all = client.get_all_progress(&other);
        assert_eq!(all.len(), 0);
    }

    // ============================================================================
    // Reset Progress Tests
    // ============================================================================

    #[test]
    fn test_admin_can_reset_progress() {
        let (_, client, admin, student) = setup();
        let course = symbol_short!("RUST101");
        client.record_progress(&student, &student, &course, &80);
        client.reset_progress(&admin, &student, &course);
        assert!(client.get_progress(&student, &course).is_none());
    }

    #[test]
    fn test_reset_removes_from_secondary_index() {
        let (_, client, admin, student) = setup();
        let c1 = symbol_short!("RUST101");
        let c2 = symbol_short!("SOL201");
        client.record_progress(&student, &student, &c1, &100);
        client.record_progress(&student, &student, &c2, &50);
        client.reset_progress(&admin, &student, &c1);
        let all = client.get_all_progress(&student);
        assert_eq!(all.len(), 1);
        assert_eq!(all.get(0).unwrap().course_id, c2);
    }

    #[test]
    #[should_panic(expected = "Only admin can reset progress")]
    fn test_non_admin_cannot_reset_progress() {
        let (env, client, _, student) = setup();
        let rando = Address::generate(&env);
        let course = symbol_short!("RUST101");
        client.record_progress(&student, &student, &course, &80);
        client.reset_progress(&rando, &student, &course);
    }

    // ============================================================================
    // Event Filtering Tests
    // ============================================================================

    #[test]
    fn test_get_completed_courses() {
        let (_, client, _, student) = setup();
        let c1 = symbol_short!("RUST101");
        let c2 = symbol_short!("SOL201");
        let c3 = symbol_short!("WEB301");
        client.record_progress(&student, &student, &c1, &100);
        client.record_progress(&student, &student, &c2, &50);
        client.record_progress(&student, &student, &c3, &100);
        
        let completed = client.get_completed_courses(&student);
        assert_eq!(completed.len(), 2);
    }

    #[test]
    fn test_get_in_progress_courses() {
        let (_, client, _, student) = setup();
        let c1 = symbol_short!("RUST101");
        let c2 = symbol_short!("SOL201");
        let c3 = symbol_short!("WEB301");
        client.record_progress(&student, &student, &c1, &100);
        client.record_progress(&student, &student, &c2, &50);
        client.record_progress(&student, &student, &c3, &75);
        
        let in_progress = client.get_in_progress_courses(&student);
        assert_eq!(in_progress.len(), 2);
    }

    #[test]
    fn test_get_progress_paginated() {
        let (_, client, _, student) = setup();
        let c1 = symbol_short!("RUST101");
        let c2 = symbol_short!("SOL201");
        let c3 = symbol_short!("WEB301");
        client.record_progress(&student, &student, &c1, &100);
        client.record_progress(&student, &student, &c2, &50);
        client.record_progress(&student, &student, &c3, &75);
        
        let page1 = client.get_progress_paginated(&student, &0, &2);
        assert_eq!(page1.len(), 2);
        
        let page2 = client.get_progress_paginated(&student, &2, &2);
        assert_eq!(page2.len(), 1);
        
        let page3 = client.get_progress_paginated(&student, &5, &2);
        assert_eq!(page3.len(), 0);
    }

    #[test]
    fn test_get_progress_above_threshold() {
        let (_, client, _, student) = setup();
        let c1 = symbol_short!("RUST101");
        let c2 = symbol_short!("SOL201");
        let c3 = symbol_short!("WEB301");
        client.record_progress(&student, &student, &c1, &100);
        client.record_progress(&student, &student, &c2, &50);
        client.record_progress(&student, &student, &c3, &75);
        
        let above_75 = client.get_progress_above_threshold(&student, &75);
        assert_eq!(above_75.len(), 2);
        
        let above_50 = client.get_progress_above_threshold(&student, &50);
        assert_eq!(above_50.len(), 3);
    }

    #[test]
    #[should_panic(expected = "Threshold must be 0-100")]
    fn test_progress_threshold_validation() {
        let (_, client, _, student) = setup();
        client.get_progress_above_threshold(&student, &101);
    }

    #[test]
    fn test_count_completed_courses() {
        let (_, client, _, student) = setup();
        let c1 = symbol_short!("RUST101");
        let c2 = symbol_short!("SOL201");
        let c3 = symbol_short!("WEB301");
        client.record_progress(&student, &student, &c1, &100);
        client.record_progress(&student, &student, &c2, &50);
        client.record_progress(&student, &student, &c3, &100);
        
        assert_eq!(client.count_completed_courses(&student), 2);
    }

    #[test]
    fn test_get_average_progress() {
        let (_, client, _, student) = setup();
        let c1 = symbol_short!("RUST101");
        let c2 = symbol_short!("SOL201");
        let c3 = symbol_short!("WEB301");
        client.record_progress(&student, &student, &c1, &100);
        client.record_progress(&student, &student, &c2, &50);
        client.record_progress(&student, &student, &c3, &75);
        
        let avg = client.get_average_progress(&student);
        assert_eq!(avg, 75); // (100 + 50 + 75) / 3 = 75
    }

    #[test]
    fn test_get_average_progress_empty() {
        let (env, client, _, student) = setup();
        let other = Address::generate(&env);
        assert_eq!(client.get_average_progress(&other), 0);
    }
}
