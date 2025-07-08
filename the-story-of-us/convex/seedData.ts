import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedTestData = mutation({
  args: {
    anonymousId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Starting to seed test data with anonymousId:", args.anonymousId);
    
    // Check if data already exists for this anonymous ID
    const existingBabies = await ctx.db
      .query("babies")
      .withIndex("by_anonymous", (q) => q.eq("anonymousId", args.anonymousId))
      .collect();
    
    if (existingBabies.length > 0) {
      return { message: "Data already seeded", babyCount: existingBabies.length };
    }

    // Create a test baby
    const babyId = await ctx.db.insert("babies", {
      name: "Emma",
      birthDate: new Date("2024-01-15").getTime(),
      gender: "female",
      birthWeight: 7.2,
      birthWeightUnit: "lb",
      birthLength: 20,
      birthLengthUnit: "in",
      anonymousId: args.anonymousId,
      createdAt: Date.now(),
    });
    
    console.log("Created baby with ID:", babyId);
    
    // Create some milestone entries
    const milestones = await ctx.db.query("milestones").collect();
    console.log("Found", milestones.length, "milestones");
    
    // Log some milestones
    const milestoneData = [
      { name: "First Smile", achievedDate: "2024-03-10", notes: "She smiled at daddy during morning cuddles!" },
      { name: "Rolled Over", achievedDate: "2024-05-20", notes: "First rolled from tummy to back during tummy time" },
      { name: "First Laugh", achievedDate: "2024-04-15", notes: "Laughed at peek-a-boo for the first time!" },
      { name: "Sat Without Support", achievedDate: "2024-07-01", notes: "Finally sitting up on her own!" },
      { name: "First Word", achievedDate: "2024-10-15", notes: "Said 'mama' clear as day!", metadata: { word: "mama" } },
    ];
    
    for (const data of milestoneData) {
      const milestone = milestones.find(m => m.name === data.name);
      if (milestone) {
        await ctx.db.insert("milestoneEntries", {
          babyId,
          milestoneId: milestone._id,
          achievedDate: new Date(data.achievedDate).getTime(),
          notes: data.notes,
          metadata: data.metadata,
          anonymousId: args.anonymousId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        console.log("Created milestone entry for:", data.name);
      }
    }
    
    // Create some photos
    const photoData = [
      {
        caption: "First day home from the hospital 💕",
        date: new Date("2024-01-18").getTime(),
        mediaType: "image" as const,
      },
      {
        caption: "Tummy time champion!",
        date: new Date("2024-04-05").getTime(),
        mediaType: "image" as const,
      },
      {
        caption: "Beach day with the family",
        date: new Date("2024-08-15").getTime(),
        mediaType: "image" as const,
        tags: ["beach", "family", "summer"],
      },
    ];
    
    for (const photo of photoData) {
      await ctx.db.insert("photos", {
        babyId,
        caption: photo.caption,
        date: photo.date,
        mediaUrls: ["https://images.pexels.com/photos/1391487/pexels-photo-1391487.jpeg"], // Placeholder
        mediaTypes: [photo.mediaType],
        anonymousId: args.anonymousId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      console.log("Created photo:", photo.caption);
    }
    
    // Create some journal entries
    const journalData = [
      {
        title: "Feeling overwhelmed but grateful",
        content: "Today was tough. Emma was fussy all morning and I barely got any sleep. But then she looked at me and smiled, and suddenly everything felt worth it. Being a parent is the hardest and most beautiful thing I've ever done.",
        mood: "tired" as const,
        date: new Date("2024-02-20").getTime(),
      },
      {
        content: "Emma discovered her feet today! She spent 20 minutes just staring at them and trying to grab them. The look of concentration on her face was priceless. I love watching her discover the world.",
        mood: "happy" as const,
        date: new Date("2024-06-10").getTime(),
      },
      {
        title: "First time saying mama",
        content: "I can't stop crying happy tears. Emma said 'mama' today! She's been babbling for weeks, but this was clear as day. She looked right at me and said it. My heart is so full.",
        mood: "excited" as const,
        date: new Date("2024-10-15").getTime(),
      },
    ];
    
    for (const entry of journalData) {
      await ctx.db.insert("journal", {
        babyId,
        title: entry.title,
        content: entry.content,
        mood: entry.mood,
        date: entry.date,
        anonymousId: args.anonymousId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      console.log("Created journal entry:", entry.title || "Untitled");
    }
    
    // Create some firsts
    const firstsData = [
      {
        type: "first_food",
        title: "First Solid Food",
        description: "Tried mashed avocado today! Made the funniest face but kept eating.",
        metadata: { food: "avocado" },
        date: new Date("2024-07-20").getTime(),
      },
      {
        type: "first_tooth",
        title: "First Tooth",
        description: "Bottom front tooth finally popped through after days of drooling!",
        date: new Date("2024-08-05").getTime(),
      },
    ];
    
    for (const first of firstsData) {
      await ctx.db.insert("firsts", {
        babyId,
        type: first.type,
        title: first.title,
        description: first.description,
        metadata: first.metadata,
        date: first.date,
        anonymousId: args.anonymousId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      console.log("Created first:", first.title);
    }
    
    // Create growth logs (converting to lbs and inches for US audience)
    const growthData = [
      { date: "2024-01-15", weight: 7.2, weightUnit: "lb" as const, height: 20, heightUnit: "in" as const, notes: "Birth measurements" }, 
      { date: "2024-02-15", weight: 10, weightUnit: "lb" as const, height: 21.5, heightUnit: "in" as const, notes: "1 month checkup" },
      { date: "2024-04-15", weight: 13.7, weightUnit: "lb" as const, height: 23.6, heightUnit: "in" as const, notes: "3 month checkup" },
      { date: "2024-07-15", weight: 17.2, weightUnit: "lb" as const, height: 26, heightUnit: "in" as const, notes: "6 month checkup - doing great!" },
      { date: "2024-10-15", weight: 20, weightUnit: "lb" as const, height: 28.3, heightUnit: "in" as const, notes: "9 month checkup" },
    ];
    
    for (const growth of growthData) {
      await ctx.db.insert("growthLogs", {
        babyId,
        date: new Date(growth.date).getTime(),
        weight: growth.weight,
        weightUnit: growth.weightUnit,
        height: growth.height,
        heightUnit: growth.heightUnit,
        notes: growth.notes,
        anonymousId: args.anonymousId,
        createdAt: Date.now(),
      });
      console.log("Created growth log for:", growth.date);
    }
    
    console.log("Test data seeding complete!");
    
    return { babyId, success: true };
  },
});