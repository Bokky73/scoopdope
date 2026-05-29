#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol, Vec,
};

#[contracttype]
pub enum DataKey {
    Admin,
    Metadata(u64),               // credential_id -> MetadataRecord
    StudentCredentials(Address), // student -> Vec<u64>
    NextCredentialId,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct MetadataRecord {
    pub credential_id: u64,
    pub student: Address,
    pub course_name: String,
    pub completion_date: u64,
    pub grade: String,
    pub skills: Vec<String>,
}

const STORE: Symbol = symbol_short!("store");

#[contract]
pub struct CredentialMetadataContract;

#[contractimpl]
impl CredentialMetadataContract {
    /// Initialize the contract with an admin address.
    pub fn initialize(env: Env, admin: Address) {
        assert!(
            !env.storage().instance().has(&DataKey::Admin),
            "Already initialized"
        );
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::NextCredentialId, &1u64);
    }

    /// Store metadata for a new credential.
    /// This is immutable: once stored for a specific ID, it cannot be changed.
    pub fn store_metadata(
        env: Env,
        admin: Address,
        student: Address,
        course_name: String,
        completion_date: u64,
        grade: String,
        skills: Vec<String>,
    ) -> u64 {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).expect("Not initialized");
        assert!(admin == stored_admin, "Only admin can store metadata");

        let credential_id: u64 = env.storage().instance().get(&DataKey::NextCredentialId).unwrap_or(1);

        let metadata = MetadataRecord {
            credential_id,
            student: student.clone(),
            course_name,
            completion_date,
            grade,
            skills,
        };

        // Store metadata
        env.storage()
            .persistent()
            .set(&DataKey::Metadata(credential_id), &metadata);

        // Update student index for easy querying
        let mut student_creds: Vec<u64> = env.storage()
            .persistent()
            .get(&DataKey::StudentCredentials(student.clone()))
            .unwrap_or(Vec::new(&env));
        student_creds.push_back(credential_id);
        env.storage()
            .persistent()
            .set(&DataKey::StudentCredentials(student), &student_creds);

        // Increment ID for next issuance
        env.storage().instance().set(&DataKey::NextCredentialId, &(credential_id + 1));

        env.events()
            .publish((STORE, symbol_short!("cred")), credential_id);
            
        credential_id
    }

    /// Retrieve metadata for a specific credential ID.
    pub fn get_metadata(env: Env, credential_id: u64) -> Option<MetadataRecord> {
        env.storage()
            .persistent()
            .get(&DataKey::Metadata(credential_id))
    }

    /// Retrieve all metadata records for a specific student.
    pub fn get_student_credentials(env: Env, student: Address) -> Vec<MetadataRecord> {
        let cred_ids: Vec<u64> = env.storage()
            .persistent()
            .get(&DataKey::StudentCredentials(student))
            .unwrap_or(Vec::new(&env));
            
        let mut results = Vec::new(&env);
        for id in cred_ids.iter() {
            if let Some(meta) = env.storage().persistent().get::<DataKey, MetadataRecord>(&DataKey::Metadata(id)) {
                results.push_back(meta);
            }
        }
        results
    }
}
