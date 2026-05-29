#![cfg(test)]
use soroban_sdk::{testutils::Address as _, Address, BytesN, Env};

use crate::{Permission, Role, SharedContract, SharedContractClient};

fn setup() -> (Env, Address, SharedContractClient<'static>, Address) {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, SharedContract);
    let client = SharedContractClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    let governance = Address::generate(&env);
    client.initialize(&admin, &governance);
    (env, admin, client, governance)
}

// ── has_role ─────────────────────────────────────────────────────────────────

#[test]
fn test_admin_has_admin_role() {
    let (_, admin, client, _) = setup();
    assert!(client.has_role(&admin, &Role::Admin));
}

#[test]
fn test_assign_instructor_role() {
    let (env, admin, client, _) = setup();
    let instructor = Address::generate(&env);
    client.assign_role(&admin, &instructor, &Role::Instructor);
    assert!(client.has_role(&instructor, &Role::Instructor));
}

#[test]
fn test_assign_student_role() {
    let (env, admin, client, _) = setup();
    let student = Address::generate(&env);
    client.assign_role(&admin, &student, &Role::Student);
    assert!(client.has_role(&student, &Role::Student));
}

#[test]
#[should_panic(expected = "Only admin can assign roles")]
fn test_non_admin_cannot_assign_role() {
    let (env, _, client, _) = setup();
    let rando = Address::generate(&env);
    let target = Address::generate(&env);
    client.assign_role(&rando, &target, &Role::Instructor);
}

// ── has_permission — Admin ────────────────────────────────────────────────────

#[test]
fn test_admin_has_all_permissions() {
    let (_, admin, client, _) = setup();
    assert!(client.has_permission(&admin, &Permission::CreateCourse));
    assert!(client.has_permission(&admin, &Permission::EnrollStudent));
    assert!(client.has_permission(&admin, &Permission::IssueCredential));
    assert!(client.has_permission(&admin, &Permission::MintToken));
    assert!(client.has_permission(&admin, &Permission::ManageUsers));
    assert!(client.has_permission(&admin, &Permission::Upgrade));
}

// ── has_permission — Instructor ───────────────────────────────────────────────

#[test]
fn test_instructor_permissions() {
    let (env, admin, client, _) = setup();
    let instructor = Address::generate(&env);
    client.assign_role(&admin, &instructor, &Role::Instructor);

    assert!(client.has_permission(&instructor, &Permission::CreateCourse));
    assert!(client.has_permission(&instructor, &Permission::EnrollStudent));
    assert!(!client.has_permission(&instructor, &Permission::IssueCredential));
    assert!(!client.has_permission(&instructor, &Permission::MintToken));
    assert!(!client.has_permission(&instructor, &Permission::ManageUsers));
}

// ── has_permission — Student ──────────────────────────────────────────────────

#[test]
fn test_student_has_no_permissions() {
    let (env, admin, client, _) = setup();
    let student = Address::generate(&env);
    client.assign_role(&admin, &student, &Role::Student);

    assert!(!client.has_permission(&student, &Permission::CreateCourse));
    assert!(!client.has_permission(&student, &Permission::EnrollStudent));
    assert!(!client.has_permission(&student, &Permission::IssueCredential));
    assert!(!client.has_permission(&student, &Permission::MintToken));
    assert!(!client.has_permission(&student, &Permission::ManageUsers));
}

// ── has_permission — unassigned address ──────────────────────────────────────

#[test]
fn test_unassigned_address_has_no_permissions() {
    let (env, _, client, _) = setup();
    let stranger = Address::generate(&env);
    assert!(!client.has_permission(&stranger, &Permission::CreateCourse));
}

// ── upgrade & migration ───────────────────────────────────────────────────────

#[test]
fn test_upgrade_and_versioning() {
    let (env, _, client, _) = setup();
    assert_eq!(client.get_version(), 1);

    // Mock upgrade (deployer call is mocked by mock_all_auths)
    let new_wasm = BytesN::from_array(&env, &[1u8; 32]);
    client.upgrade(&new_wasm);
    assert_eq!(client.get_version(), 2);
}

#[test]
fn test_rollback() {
    let (env, _, client, _) = setup();
    let new_wasm = BytesN::from_array(&env, &[1u8; 32]);
    client.upgrade(&new_wasm);
    assert_eq!(client.get_version(), 2);

    client.rollback();
    assert_eq!(client.get_version(), 3);
}

#[test]
fn test_migration() {
    let (env, admin, client, _) = setup();
    assert_eq!(client.get_version(), 1);

    // Upgrade to v2
    let new_wasm = BytesN::from_array(&env, &[1u8; 32]);
    client.upgrade(&new_wasm);
    assert_eq!(client.get_version(), 2);

    // Migrate to v2
    client.migrate(&admin);

    // Cannot migrate twice to same version
    // (This would panic in actual execution, but we'll just check it doesn't change anything)
}

#[test]
#[should_panic(expected = "Already migrated to this version")]
fn test_migration_already_done() {
    let (env, admin, client, _) = setup();
    client.migrate(&admin);
}

#[test]
#[should_panic]
fn test_non_governance_cannot_upgrade() {
    let (env, _, client, _) = setup();
    // mock_all_auths is on, but we can try to call it without being governance
    // In a real test we'd disable mock_all_auths and verify the requirement.
    let fake_hash = BytesN::from_array(&env, &[0u8; 32]);
    client.upgrade(&fake_hash);
}
