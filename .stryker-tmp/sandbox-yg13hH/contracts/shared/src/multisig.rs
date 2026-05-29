use soroban_sdk::{contracttype, Address, Env, String, Symbol, symbol_short, Vec};

#[contracttype]
#[derive(Clone)]
pub struct MultiSigProposal {
    pub id: u64,
    pub operation: String,
    pub proposer: Address,
    pub approvals: Vec<Address>,
    pub threshold: u32,
    pub created_ledger: u32,
    pub expires_ledger: u32,
    pub executed: bool,
}

#[contracttype]
pub enum MultiSigKey {
    Proposal(u64),
    NextProposalId,
    Threshold,
    Admins,
    ProposalTimeout,
}

pub const MULTISIG_PROPOSAL_CREATED: Symbol = symbol_short!("ms_prop");
pub const MULTISIG_APPROVED: Symbol = symbol_short!("ms_appr");
pub const MULTISIG_EXECUTED: Symbol = symbol_short!("ms_exec");
pub const MULTISIG_EXPIRED: Symbol = symbol_short!("ms_exp");

pub fn create_proposal(
    env: &Env,
    operation: String,
    proposer: Address,
    threshold: u32,
    timeout_ledgers: u32,
) -> u64 {
    proposer.require_auth();

    let id: u64 = env
        .storage()
        .instance()
        .get(&MultiSigKey::NextProposalId)
        .unwrap_or(1);

    let proposal = MultiSigProposal {
        id,
        operation,
        proposer: proposer.clone(),
        approvals: Vec::new(env),
        threshold,
        created_ledger: env.ledger().sequence(),
        expires_ledger: env.ledger().sequence() + timeout_ledgers,
        executed: false,
    };

    env.storage()
        .instance()
        .set(&MultiSigKey::Proposal(id), &proposal);
    env.storage()
        .instance()
        .set(&MultiSigKey::NextProposalId, &(id + 1));

    env.events()
        .publish((MULTISIG_PROPOSAL_CREATED,), (id, proposer));

    id
}

pub fn approve_proposal(env: &Env, proposal_id: u64, approver: Address) {
    approver.require_auth();

    let mut proposal: MultiSigProposal = env
        .storage()
        .instance()
        .get(&MultiSigKey::Proposal(proposal_id))
        .expect("Proposal not found");

    assert!(!proposal.executed, "Proposal already executed");
    assert!(
        env.ledger().sequence() < proposal.expires_ledger,
        "Proposal expired"
    );

    let mut approvals = proposal.approvals.clone();
    assert!(
        !approvals.iter().any(|a| a == approver),
        "Already approved"
    );

    approvals.push_back(approver.clone());
    proposal.approvals = approvals;

    env.storage()
        .instance()
        .set(&MultiSigKey::Proposal(proposal_id), &proposal);

    env.events()
        .publish((MULTISIG_APPROVED,), (proposal_id, approver));
}

pub fn execute_proposal(env: &Env, proposal_id: u64) -> bool {
    let mut proposal: MultiSigProposal = env
        .storage()
        .instance()
        .get(&MultiSigKey::Proposal(proposal_id))
        .expect("Proposal not found");

    assert!(!proposal.executed, "Already executed");

    if env.ledger().sequence() >= proposal.expires_ledger {
        env.events()
            .publish((MULTISIG_EXPIRED,), (proposal_id,));
        return false;
    }

    if proposal.approvals.len() as u32 >= proposal.threshold {
        proposal.executed = true;
        env.storage()
            .instance()
            .set(&MultiSigKey::Proposal(proposal_id), &proposal);

        env.events()
            .publish((MULTISIG_EXECUTED,), (proposal_id,));
        return true;
    }

    false
}

pub fn get_proposal(env: &Env, proposal_id: u64) -> Option<MultiSigProposal> {
    env.storage()
        .instance()
        .get(&MultiSigKey::Proposal(proposal_id))
}
