use soroban_sdk::{contracttype, Address, Env, String, Symbol, symbol_short, Vec};

#[contracttype]
#[derive(Clone)]
pub struct VotingProposal {
    pub id: u64,
    pub title: String,
    pub description: String,
    pub voting_start_ledger: u32,
    pub voting_end_ledger: u32,
    pub votes_for: i128,
    pub votes_against: i128,
    pub total_votes: i128,
    pub quorum_required: i128,
    pub executed: bool,
}

#[contracttype]
pub enum GovernanceKey {
    Proposal(u64),
    Vote(u64, Address),
    Delegate(Address),
    NextProposalId,
    TotalSupply,
    QuorumPercentage,
}

pub const PROPOSAL_CREATED: Symbol = symbol_short!("gov_prop");
pub const VOTE_CAST: Symbol = symbol_short!("gov_vote");
pub const VOTE_DELEGATED: Symbol = symbol_short!("gov_del");
pub const PROPOSAL_EXECUTED: Symbol = symbol_short!("gov_exec");

pub fn create_proposal(
    env: &Env,
    proposer: Address,
    title: String,
    description: String,
    voting_end_ledger: u32,
) -> u64 {
    proposer.require_auth();

    let total_supply: i128 = env
        .storage()
        .instance()
        .get(&GovernanceKey::TotalSupply)
        .unwrap_or(1_000_000_000_000_000);

    let quorum_percentage: i128 = env
        .storage()
        .instance()
        .get(&GovernanceKey::QuorumPercentage)
        .unwrap_or(20); // 20% default

    let quorum_required = (total_supply * quorum_percentage) / 100;

    let id: u64 = env
        .storage()
        .instance()
        .get(&GovernanceKey::NextProposalId)
        .unwrap_or(1);

    let proposal = VotingProposal {
        id,
        title,
        description,
        voting_start_ledger: env.ledger().sequence(),
        voting_end_ledger,
        votes_for: 0,
        votes_against: 0,
        total_votes: 0,
        quorum_required,
        executed: false,
    };

    env.storage()
        .instance()
        .set(&GovernanceKey::Proposal(id), &proposal);
    env.storage()
        .instance()
        .set(&GovernanceKey::NextProposalId, &(id + 1));

    env.events()
        .publish((PROPOSAL_CREATED,), (id, proposer, quorum_required));

    id
}

pub fn cast_vote(
    env: &Env,
    proposal_id: u64,
    voter: Address,
    support: bool,
    weight: i128,
) {
    voter.require_auth();

    let mut proposal: VotingProposal = env
        .storage()
        .instance()
        .get(&GovernanceKey::Proposal(proposal_id))
        .expect("Proposal not found");

    assert!(
        env.ledger().sequence() < proposal.voting_end_ledger,
        "Voting period ended"
    );

    let already_voted: Option<bool> = env
        .storage()
        .instance()
        .get(&GovernanceKey::Vote(proposal_id, voter.clone()));

    assert!(already_voted.is_none(), "Already voted");

    if support {
        proposal.votes_for += weight;
    } else {
        proposal.votes_against += weight;
    }
    proposal.total_votes += weight;

    env.storage()
        .instance()
        .set(&GovernanceKey::Vote(proposal_id, voter.clone()), &support);
    env.storage()
        .instance()
        .set(&GovernanceKey::Proposal(proposal_id), &proposal);

    env.events()
        .publish((VOTE_CAST,), (proposal_id, voter, support, weight));
}

pub fn delegate_vote(env: &Env, delegator: Address, delegate: Address) {
    delegator.require_auth();

    env.storage()
        .instance()
        .set(&GovernanceKey::Delegate(delegator.clone()), &delegate);

    env.events()
        .publish((VOTE_DELEGATED,), (delegator, delegate));
}

pub fn execute_proposal(env: &Env, proposal_id: u64) -> bool {
    let mut proposal: VotingProposal = env
        .storage()
        .instance()
        .get(&GovernanceKey::Proposal(proposal_id))
        .expect("Proposal not found");

    assert!(!proposal.executed, "Already executed");
    assert!(
        env.ledger().sequence() >= proposal.voting_end_ledger,
        "Voting still ongoing"
    );

    let quorum_met = proposal.total_votes >= proposal.quorum_required;
    let passed = proposal.votes_for > proposal.votes_against;

    if quorum_met && passed {
        proposal.executed = true;
        env.storage()
            .instance()
            .set(&GovernanceKey::Proposal(proposal_id), &proposal);

        env.events()
            .publish((PROPOSAL_EXECUTED,), (proposal_id, true));
        return true;
    }

    env.events()
        .publish((PROPOSAL_EXECUTED,), (proposal_id, false));
    false
}

pub fn get_proposal(env: &Env, proposal_id: u64) -> Option<VotingProposal> {
    env.storage()
        .instance()
        .get(&GovernanceKey::Proposal(proposal_id))
}

pub fn get_delegate(env: &Env, delegator: Address) -> Option<Address> {
    env.storage()
        .instance()
        .get(&GovernanceKey::Delegate(delegator))
}
