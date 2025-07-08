import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// One-time mutation to update Leo's birth data
export const updateLeoBirthData = mutation({
  handler: async (ctx) => {
    const leoId = "j578dbm8adbvjsn952jzwmbp197k8b51" as Id<"babies">;
    
    await ctx.db.patch(leoId, {
      birthWeight: 8.5,
      birthWeightUnit: "lb",
      birthLength: 21,
      birthLengthUnit: "in",
    });
    
    return { success: true, message: "Updated Leo's birth data" };
  },
});