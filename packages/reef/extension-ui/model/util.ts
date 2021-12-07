import {Pool, Token, TokenWithAmount, utils} from "@reef-defi/react-lib";

export const combineTokensDistinct = ([tokens1, tokens2 ]:[Token[], Token[]])=>{
  const combinedT = [...tokens1];
  tokens2.forEach((vT: Token) => !combinedT.some(cT => cT.address === vT.address) ? combinedT.push(vT) : null);
  return combinedT;
};

export const toTokensWithPrice = ([tokens, reefPrice, pools]:[Token[], number, Pool[]])=>{
  return tokens.map(token=>({...token, price: utils.calculateTokenPrice(token, pools, reefPrice)} as TokenWithAmount))
};
