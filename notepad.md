Deployment URL
This development Convex deployment is hosted at the following URL.

Configure a Convex client with this URL while developing locally.
Convex URL: https://glorious-manatee-479.convex.cloud

HTTP Actions URL
This development Convex deployment hosts HTTP Actions at the following URL.

In Convex functions, this is available as process.env.CONVEX_SITE_URL.
https://glorious-manatee-479.convex.site



FEATURES
a way to change baby, if you have multiple babies 
activity ideas with your baby with illustrations inside
explore the app with pre made data inside that we premade
New Favorite
    - TOY
    - ANIMAL
    - FOOD
    - MOVIE
    - BOOK
- this is how your timeline could look like, show a prepopulated timeline 



TIMELINE
Journal Entries
Photo and Video Entries
Milestone Entries
First Time Entries
Birth Card
Growth Card





The Solution:
Instead of adding "Appointment" to the creation modal, we'll keep the Appointment Log as a utility within the Toolbox tab. Its purpose is for future planning and reminders.
When a mother wants to document a past appointment, the best way is through a Journal Entry. We can even create a special template for it later, so when she taps "Journal Entry," she could choose between a "Blank Note" or an "Appointment Note" with pre-filled fields for doctor's name, weight, and notes.
For now, we'll stick to your refined list for the modal, as it's clean, focused, and covers the core memory types.







App Concept Document: "The Story of Us"
Part 1: High-Level Concept
App Name: The Story of Us
Mission Statement: To provide mothers with a beautiful, private, and supportive space to document the entire journey of early motherhood—from pregnancy to childhood—creating a living digital heirloom for their family while nurturing their own well-being.
Target Audience: Expecting mothers, new mothers, and mothers of young children (from pregnancy through age 5).
Core Differentiators (USPs):
The Unified Timeline: A single, continuous story that begins with pregnancy and seamlessly flows into childhood, honoring the mother's journey as the foundation.
Story-Driven Milestones: We go beyond data points. Unique, dedicated UIs for key milestones encourage parents to capture the story behind the event, not just the date.
Dual Focus: The app is a partnership—it's a story builder for the child and a sanctuary for the mother.
Intimate & Private Sharing: The "Family Circle" feature allows for sharing memories with a small, curated group, keeping priceless moments off public social media.
Part 2: The User Journey & App Modes
The app is built around a single user journey that dynamically adapts. It is not two separate apps, but one app with two phases.
Phase 1: The Story Begins (Pregnancy Mode)
Trigger: User signs up and enters a due date.
Focus: The mother's experience, her health, well-being, and the anticipation of arrival.
The Transition Event: "Welcome to the World!"
Trigger: After the due date, the user is prompted to confirm the baby's arrival.
Experience: A celebratory, guided flow to enter the baby's name, birthdate, time, weight, length, and a first photo.
Outcome: This automatically generates a beautiful "Birth Announcement" card that becomes the newest entry on the Unified Timeline, marking the start of the next chapter.
Phase 2: The Story Unfolds (Parenting Mode)
Trigger: Completion of the "Welcome to the World!" flow.
Focus: Capturing the child's growth, milestones, and memories, while providing continued support for the mother.
Part 3: Detailed App Structure (Tab Breakdown)
The app will use a simple, four-tab bottom navigation for ease of use.
Purpose: The emotional heart of the app. A beautiful, visual, reverse-chronological feed of the entire family journey. This is the first screen users see upon opening the app.
Content: A mixed feed of all memory types, displayed as elegant "cards":
Journal Entries: Showing a title and text snippet.
Photos & Videos: Showcased with the child's age at the time.
Milestones: Marked with a special icon (e.g., ⭐️) for easy identification.
Growth Updates: e.g., "Weighed 10 lbs 2 oz today!"
Pregnancy Memories: Bump photos and pregnancy journal entries remain at the bottom of the timeline, forming the story's foundation.
Purpose: The organized, structured view for tracking progress and seeing what's to come in a non-anxiety-inducing way.
In Pregnancy Mode: This tab is the "Pregnancy Checklist."
Features: Customizable lists for different trimesters (e.g., "Research pediatricians," "Pack hospital bag," "Set up nursery"). Items can be checked off as they are completed.
In Parenting Mode: This tab becomes the "Milestones Guide."
Features:
Milestones grouped by age (0-3 months, 4-6 months, etc.) and category (Physical, Cognitive, Language, Social).
Each item is a tappable link (e.g., "First Smile"). Tapping it opens the dedicated UI to log that specific milestone.
A clear visual distinction between logged milestones (e.g., colored in, checkmark) and upcoming ones.
Purpose: The functional, utilitarian hub for practical, day-to-day needs. The tools displayed here adapt based on the user's current mode.
In Pregnancy Mode:
Kick Tracker: Simple tap interface to count fetal movements.
Contraction Timer: Log duration and frequency.
Appointment Log: Track prenatal visits, notes, and questions for the doctor.
Hospital Bag Checklist: Pre-populated and customizable list.
Hydration Tracker & Medication Log.
In Parenting Mode:
Feeding Tracker: Log breastfeeding (side/duration) or bottle-feeding (amount).
Diaper Log: Quickly track wet/dirty diapers with a single tap.
Sleep Log: Simple start/stop timer for naps and nighttime sleep.
Growth Charts: A visual way to track weight, height, and head circumference percentiles.
Vaccination Log: Track immunization dates and upcoming shots.
Purpose: A dedicated, calm space for the mother's mental and emotional well-being. This feature remains consistent, but its content evolves with her journey.
In Pregnancy Mode:
Guided Meditations: For anxiety, connecting with the baby, labor preparation.
Journal: A private space for personal reflection, separate from the baby's timeline. Prompts tailored to pregnancy.
Breathing Exercises.
In Parenting Mode:
Guided Meditations: For postpartum stress, finding patience, sleep deprivation, and self-compassion ("5-Minute Mom Reset").
Journal: The same private space, now with prompts relevant to new motherhood.
Postpartum-safe exercises and wellness articles.
Part 4: Global App Features
These are core functionalities accessible throughout the app.
The "+" Add Memory Button:
Location: A prominent, floating action button on the Timeline screen.
Function: Tapping it opens a simple menu to initiate the app's core actions:
Log a Milestone (goes to the Milestones screen).
Add a Photo / Video (opens camera or gallery).
Write a Journal Entry (opens a rich-text editor).
Track Growth / Health (opens the relevant tool).
The Family Circle (Private Sharing):
Setup: In the Profile/Settings, the user can generate a unique, private link to invite a small number of people (partner, grandparents, etc.).
Invitee Experience: Invited members can access a simplified, view-only version of the Timeline.
Interaction: They can leave heart-reactions and supportive comments on timeline entries, fostering connection without compromising privacy.
Profile & Settings:
Manage user account details.
Manage child profiles (allowing for multiple children, each with their own unique timeline).
Manage the Family Circle invites.
Set notification preferences.