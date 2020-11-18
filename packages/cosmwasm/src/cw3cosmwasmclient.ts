/* eslint-disable @typescript-eslint/naming-convention */
import { BroadcastMode, GasLimits, GasPrice, OfflineSigner } from "@cosmjs/launchpad";

import { CosmWasmFeeTable, ExecuteResult, SigningCosmWasmClient } from "./signingcosmwasmclient";

export type Expiration =
  | {
      readonly at_height: number;
    }
  | {
      readonly at_time: number;
    };

export enum Vote {
  Yes = "yes",
  No = "no",
  Abstain = "abstain",
  Veto = "veto",
}

export interface ThresholdResult {
  readonly absolute_count: {
    readonly weight_needed: number;
    readonly total_weight: number;
  };
}

export interface ProposalResult {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly msgs: ReadonlyArray<Record<string, unknown>>;
  readonly expires: Expiration;
  readonly status: string;
}

export interface ProposalsResult {
  readonly proposals: readonly ProposalResult[];
}

export interface VoteResult {
  readonly vote: Vote;
}

export interface VotesResult {
  readonly votes: ReadonlyArray<{ readonly vote: Vote; readonly voter: string; readonly weight: number }>;
}

export interface VoterResult {
  readonly addr: string;
  readonly weight: number;
}

export interface VotersResult {
  readonly voters: readonly VoterResult[];
}

export class Cw3CosmWasmClient extends SigningCosmWasmClient {
  private readonly cw3ContractAddress: string;

  public constructor(
    apiUrl: string,
    senderAddress: string,
    signer: OfflineSigner,
    cw3ContractAddress: string,
    gasPrice?: GasPrice,
    gasLimits?: Partial<GasLimits<CosmWasmFeeTable>>,
    broadcastMode?: BroadcastMode,
  ) {
    super(apiUrl, senderAddress, signer, gasPrice, gasLimits, broadcastMode);
    this.cw3ContractAddress = cw3ContractAddress;
  }

  public getThreshold(): Promise<ThresholdResult> {
    return this.queryContractSmart(this.cw3ContractAddress, { threshold: {} });
  }

  public getProposal(proposalId: number): Promise<ProposalResult> {
    return this.queryContractSmart(this.cw3ContractAddress, { proposal: { proposal_id: proposalId } });
  }

  public listProposals(startAfter?: number, limit?: number): Promise<ProposalsResult> {
    return this.queryContractSmart(this.cw3ContractAddress, {
      list_proposals: {
        start_after: startAfter,
        limit: limit,
      },
    });
  }

  public reverseProposals(startBefore?: number, limit?: number): Promise<ProposalsResult> {
    return this.queryContractSmart(this.cw3ContractAddress, {
      reverse_proposals: {
        start_before: startBefore,
        limit: limit,
      },
    });
  }

  public getVote(proposalId: number, voter: string): Promise<VoteResult> {
    return this.queryContractSmart(this.cw3ContractAddress, {
      vote: {
        proposal_id: proposalId,
        voter: voter,
      },
    });
  }

  public listVotes(proposalId: number, startAfter?: string, limit?: number): Promise<VotesResult> {
    return this.queryContractSmart(this.cw3ContractAddress, {
      list_votes: {
        proposal_id: proposalId,
        start_after: startAfter,
        limit: limit,
      },
    });
  }

  public getVoter(address: string): Promise<VoterResult> {
    return this.queryContractSmart(this.cw3ContractAddress, {
      voter: {
        address: address,
      },
    });
  }

  public listVoters(startAfter?: string, limit?: number): Promise<VotersResult> {
    return this.queryContractSmart(this.cw3ContractAddress, {
      list_voters: {
        start_after: startAfter,
        limit: limit,
      },
    });
  }

  public createMultisigProposal(
    title: string,
    description: string,
    msgs: ReadonlyArray<Record<string, unknown>>,
    earliest?: Expiration,
    latest?: Expiration,
    memo = "",
  ): Promise<ExecuteResult> {
    const handleMsg = {
      propose: {
        title: title,
        description: description,
        msgs: msgs,
        earliest: earliest,
        latest: latest,
      },
    };
    return this.execute(this.cw3ContractAddress, handleMsg, memo);
  }

  public voteMultisigProposal(proposalId: number, vote: Vote, memo = ""): Promise<ExecuteResult> {
    const handleMsg = {
      vote: {
        proposal_id: proposalId,
        vote: vote,
      },
    };
    return this.execute(this.cw3ContractAddress, handleMsg, memo);
  }

  public executeMultisigProposal(proposalId: number, memo = ""): Promise<ExecuteResult> {
    const handleMsg = { execute: { proposal_id: proposalId } };
    return this.execute(this.cw3ContractAddress, handleMsg, memo);
  }

  public closeMultisigProposal(proposalId: number, memo = ""): Promise<ExecuteResult> {
    const handleMsg = { close: { proposal_id: proposalId } };
    return this.execute(this.cw3ContractAddress, handleMsg, memo);
  }
}
