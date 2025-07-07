import { mutation } from "./_generated/server";

export const seedMilestones = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if milestones already exist
    const existing = await ctx.db.query("milestones").take(1);
    if (existing.length > 0) {
      return { message: "Milestones already seeded" };
    }

    const milestones = [
      // 0-3 months
      { category: "0-3 months", name: "Lifts Head", description: "Holds head up for a few moments", order: 1 },
      { category: "0-3 months", name: "Pushes Up on Arms", description: "Pushes chest up with straight arms", order: 2 },
      { category: "0-3 months", name: "Brings Hands to Mouth", description: "Brings hands to mouth", order: 3 },
      { category: "0-3 months", name: "Grasps Finger", description: "Wraps hand around adult's finger", order: 4 },
      { category: "0-3 months", name: "First Smile", description: "Smiles in response to your smile", order: 5 },
      { category: "0-3 months", name: "Recognizes Caregiver", description: "Shows recognition of familiar faces", order: 6 },
      { category: "0-3 months", name: "Makes Cooing Sounds", description: "Makes vowel sounds", order: 7 },

      // 4-7 months
      { category: "4-7 months", name: "Rolls Over", description: "From tummy to back, or back to tummy", order: 1 },
      { category: "4-7 months", name: "Sits With Support", description: "Sits with help", order: 2 },
      { category: "4-7 months", name: "Sits Without Support", description: "Sits independently", order: 3 },
      { category: "4-7 months", name: "Bears Weight on Legs", description: "Supports weight when held standing", order: 4 },
      { category: "4-7 months", name: "Reaches for Toys", description: "Deliberately grabs for toys", order: 5 },
      { category: "4-7 months", name: "Passes Object Between Hands", description: "Transfers toys from one hand to other", order: 6 },
      { category: "4-7 months", name: "First Laugh", description: "Laughs out loud", order: 7 },
      { category: "4-7 months", name: "Responds to Own Name", description: "Turns when name is called", order: 8 },
      { category: "4-7 months", name: "Makes Babbling Sounds", description: "Makes consonant sounds like 'ba-ba'", order: 9 },
      { category: "4-7 months", name: "Discovers Feet", description: "Finds and plays with feet", order: 10 },
      { category: "4-7 months", name: "Tries Solid Food", description: "First solid foods", order: 11 },
      { category: "4-7 months", name: "First Tooth", description: "First tooth appears", order: 12 },

      // 8-12 months
      { category: "8-12 months", name: "Crawls", description: "Moves around on hands and knees", order: 1 },
      { category: "8-12 months", name: "Pulls to a Stand", description: "Uses furniture to pull up", order: 2 },
      { category: "8-12 months", name: "First Steps", description: "Takes first independent steps", order: 3 },
      { category: "8-12 months", name: "Feeds Self Finger Foods", description: "Picks up and eats small foods", order: 4 },
      { category: "8-12 months", name: "Plays Peek-a-Boo", description: "Enjoys peek-a-boo games", order: 5 },
      { category: "8-12 months", name: "Claps Hands", description: "Brings hands together to clap", order: 6 },
      { category: "8-12 months", name: "Waves \"Bye-Bye\"", description: "Waves hand to say goodbye", order: 7 },
      { category: "8-12 months", name: "Imitates Sounds", description: "Copies sounds and gestures", order: 8 },
      { category: "8-12 months", name: "First Word", description: "Says first meaningful word", order: 9 },

      // 1-2 years
      { category: "1-2 years", name: "Walks Confidently", description: "Walks steadily without support", order: 1 },
      { category: "1-2 years", name: "Kicks a Ball", description: "Kicks ball forward", order: 2 },
      { category: "1-2 years", name: "Starts to Run", description: "Begins running with coordination", order: 3 },
      { category: "1-2 years", name: "Scribbles with a Crayon", description: "Makes marks with crayon", order: 4 },
      { category: "1-2 years", name: "Stacks Several Blocks", description: "Builds tower with blocks", order: 5 },
      { category: "1-2 years", name: "Says Several Single Words", description: "Has vocabulary of several words", order: 6 },
      { category: "1-2 years", name: "Combines Two Words", description: "Puts two words together", order: 7 },
      { category: "1-2 years", name: "First Haircut", description: "First haircut", order: 8 },

      // 2-5 years
      { category: "2-5 years", name: "Jumps with Two Feet", description: "Jumps off ground with both feet", order: 1 },
      { category: "2-5 years", name: "Rides a Tricycle/Scooter", description: "Pedals tricycle or rides scooter", order: 2 },
      { category: "2-5 years", name: "Hops on One Foot", description: "Balances and hops on one foot", order: 3 },
      { category: "2-5 years", name: "Draws a Circle", description: "Draws recognizable circle", order: 4 },
      { category: "2-5 years", name: "Uses Scissors", description: "Cuts with child scissors", order: 5 },
      { category: "2-5 years", name: "Gets Dressed by Self", description: "Puts on clothes independently", order: 6 },
      { category: "2-5 years", name: "Sings a Song", description: "Sings familiar songs", order: 7 },
    ];

    // Insert all milestones
    for (const milestone of milestones) {
      await ctx.db.insert("milestones", milestone);
    }

    return { message: `Seeded ${milestones.length} milestones` };
  },
});

export const refreshMilestones = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all existing milestones
    const existing = await ctx.db.query("milestones").collect();
    for (const milestone of existing) {
      await ctx.db.delete(milestone._id);
    }

    const milestones = [
      // 0-3 months
      { category: "0-3 months", name: "Lifts Head", description: "Holds head up for a few moments", order: 1 },
      { category: "0-3 months", name: "Pushes Up on Arms", description: "Pushes chest up with straight arms", order: 2 },
      { category: "0-3 months", name: "Brings Hands to Mouth", description: "Brings hands to mouth", order: 3 },
      { category: "0-3 months", name: "Grasps Finger", description: "Wraps hand around adult's finger", order: 4 },
      { category: "0-3 months", name: "First Smile", description: "Smiles in response to your smile", order: 5 },
      { category: "0-3 months", name: "Recognizes Caregiver", description: "Shows recognition of familiar faces", order: 6 },
      { category: "0-3 months", name: "Makes Cooing Sounds", description: "Makes vowel sounds", order: 7 },

      // 4-7 months
      { category: "4-7 months", name: "Rolls Over", description: "From tummy to back, or back to tummy", order: 1 },
      { category: "4-7 months", name: "Sits With Support", description: "Sits with help", order: 2 },
      { category: "4-7 months", name: "Sits Without Support", description: "Sits independently", order: 3 },
      { category: "4-7 months", name: "Bears Weight on Legs", description: "Supports weight when held standing", order: 4 },
      { category: "4-7 months", name: "Reaches for Toys", description: "Deliberately grabs for toys", order: 5 },
      { category: "4-7 months", name: "Passes Object Between Hands", description: "Transfers toys from one hand to other", order: 6 },
      { category: "4-7 months", name: "First Laugh", description: "Laughs out loud", order: 7 },
      { category: "4-7 months", name: "Responds to Own Name", description: "Turns when name is called", order: 8 },
      { category: "4-7 months", name: "Makes Babbling Sounds", description: "Makes consonant sounds like 'ba-ba'", order: 9 },
      { category: "4-7 months", name: "Discovers Feet", description: "Finds and plays with feet", order: 10 },
      { category: "4-7 months", name: "Tries Solid Food", description: "First solid foods", order: 11 },
      { category: "4-7 months", name: "First Tooth", description: "First tooth appears", order: 12 },

      // 8-12 months
      { category: "8-12 months", name: "Crawls", description: "Moves around on hands and knees", order: 1 },
      { category: "8-12 months", name: "Pulls to a Stand", description: "Uses furniture to pull up", order: 2 },
      { category: "8-12 months", name: "First Steps", description: "Takes first independent steps", order: 3 },
      { category: "8-12 months", name: "Feeds Self Finger Foods", description: "Picks up and eats small foods", order: 4 },
      { category: "8-12 months", name: "Plays Peek-a-Boo", description: "Enjoys peek-a-boo games", order: 5 },
      { category: "8-12 months", name: "Claps Hands", description: "Brings hands together to clap", order: 6 },
      { category: "8-12 months", name: "Waves \"Bye-Bye\"", description: "Waves hand to say goodbye", order: 7 },
      { category: "8-12 months", name: "Imitates Sounds", description: "Copies sounds and gestures", order: 8 },
      { category: "8-12 months", name: "First Word", description: "Says first meaningful word", order: 9 },

      // 1-2 years
      { category: "1-2 years", name: "Walks Confidently", description: "Walks steadily without support", order: 1 },
      { category: "1-2 years", name: "Kicks a Ball", description: "Kicks ball forward", order: 2 },
      { category: "1-2 years", name: "Starts to Run", description: "Begins running with coordination", order: 3 },
      { category: "1-2 years", name: "Scribbles with a Crayon", description: "Makes marks with crayon", order: 4 },
      { category: "1-2 years", name: "Stacks Several Blocks", description: "Builds tower with blocks", order: 5 },
      { category: "1-2 years", name: "Says Several Single Words", description: "Has vocabulary of several words", order: 6 },
      { category: "1-2 years", name: "Combines Two Words", description: "Puts two words together", order: 7 },
      { category: "1-2 years", name: "First Haircut", description: "First haircut", order: 8 },

      // 2-5 years
      { category: "2-5 years", name: "Jumps with Two Feet", description: "Jumps off ground with both feet", order: 1 },
      { category: "2-5 years", name: "Rides a Tricycle/Scooter", description: "Pedals tricycle or rides scooter", order: 2 },
      { category: "2-5 years", name: "Hops on One Foot", description: "Balances and hops on one foot", order: 3 },
      { category: "2-5 years", name: "Draws a Circle", description: "Draws recognizable circle", order: 4 },
      { category: "2-5 years", name: "Uses Scissors", description: "Cuts with child scissors", order: 5 },
      { category: "2-5 years", name: "Gets Dressed by Self", description: "Puts on clothes independently", order: 6 },
      { category: "2-5 years", name: "Sings a Song", description: "Sings familiar songs", order: 7 },
    ];

    // Insert all milestones
    for (const milestone of milestones) {
      await ctx.db.insert("milestones", milestone);
    }

    return { message: `Refreshed with ${milestones.length} milestones` };
  },
});