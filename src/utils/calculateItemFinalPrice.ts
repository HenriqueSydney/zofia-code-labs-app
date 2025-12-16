import { DiscountType } from "@/generated/prisma/enums";
import { CreateProposalItemDTO } from "@/repositories/IProposalRepository";

export function calculateItemFinalPrice(
  item: Omit<CreateProposalItemDTO, "finalPrice">
): number {
  const price = Number(item.price);
  const discount = Number(item.discount);

  if (item.discountType === DiscountType.PERCENTAGE) {
    // Ex: 100 - (100 * 0.10) = 90
    return price - price * (discount / 100);
  } else {
    // Ex: 100 - 10 = 90
    return price - discount;
  }
}

export function calculateProposalTotal(items: CreateProposalItemDTO[]): number {
  return items.reduce((acc, item) => acc + item.finalPrice, 0);
}
