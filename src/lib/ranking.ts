export interface RankableCard {
  id: string;
  currentBid: number;
  updatedAt: Date;
}

export function rankCards(cards: readonly RankableCard[]): RankableCard[] {
  return [...cards].sort((a, b) => {
    const bidDifference = b.currentBid - a.currentBid;
    return bidDifference !== 0
      ? bidDifference
      : a.updatedAt.getTime() - b.updatedAt.getTime();
  });
}
