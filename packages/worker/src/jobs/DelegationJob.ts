import { logger, queries, ChainData } from "@1kv/common";

export const delegationJob = async (chaindata: ChainData) => {
  const start = Date.now();

  const delegators = await chaindata.getDelegators();

  const candidates = await queries.allCandidates();

  for (const candidate of candidates) {
    const delegating = delegators.filter((delegator) => {
      if (delegator.target == candidate.stash) return true;
    });

    let totalBalance = 0;
    for (const delegator of delegating) {
      totalBalance += delegator.effectiveBalance;
    }

    await queries.setDelegation(candidate.stash, totalBalance, delegating);
  }

  const end = Date.now();

  logger.info(
    `{cron::delegationJob::ExecutionTime} started at ${new Date(
      start
    ).toString()} Done. Took ${(end - start) / 1000} seconds`
  );
};

export const processDelegationJob = async (job: any, chaindata: ChainData) => {
  logger.info(`Processing Delegation Job....`);
  await delegationJob(chaindata);
};
