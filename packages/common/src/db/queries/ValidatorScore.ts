import { ValidatorScoreModel } from "../models";
import logger from "../../logger";

export const setValidatorScore = async (
  address: string,
  session: number,
  score: any
): Promise<boolean> => {
  const {
    total,
    aggregate,
    inclusion,
    spanInclusion,
    discovered,
    nominated,
    rank,
    unclaimed,
    bonded,
    faults,
    offline,
    location,
    region,
    country,
    provider,
    councilStake,
    democracy,
    nominatorStake,
    delegations,
    randomness,
    updated,
  } = score;

  const data = await ValidatorScoreModel.findOne({
    address: address,
    session: session,
  });

  if (!data) {
    const score = new ValidatorScoreModel({
      address,
      session,
      updated,
      total,
      aggregate,
      inclusion,
      spanInclusion,
      discovered,
      nominated,
      rank,
      unclaimed,
      bonded,
      faults,
      offline,
      location,
      region,
      country,
      provider,
      councilStake,
      democracy,
      nominatorStake,
      delegations,
      randomness,
    });
    await score.save();
    return true;
  }

  await ValidatorScoreModel.findOneAndUpdate(
    {
      address: address,
      session: session,
    },
    {
      updated,
      total,
      aggregate,
      inclusion,
      spanInclusion,
      discovered,
      nominated,
      rank,
      unclaimed,
      bonded,
      faults,
      offline,
      location,
      region,
      country,
      provider,
      councilStake,
      democracy,
      nominatorStake,
      delegations,
      randomness,
    }
  ).exec();
  logger.info(`{Scored} score updated for ${address} for session ${session}`);
};

export const getValidatorScore = async (
  address: string,
  session: number
): Promise<any> => {
  return ValidatorScoreModel.findOne({
    address: address,
    session: session,
  });
};

export const getLatestValidatorScore = async (
  address: string
): Promise<any> => {
  return (
    await ValidatorScoreModel.find({ address: address })
      .sort("-updated")
      .limit(1)
  )[0];
};
