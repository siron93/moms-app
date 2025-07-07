# The Story of Us - Mom's App

A comprehensive React Native application designed to help mothers track their baby's growth, milestones, feeding, sleep, and create lasting memories.

## Features

### 📱 Core Functionality
- **Timeline View**: Track important moments and milestones
- **Growth Tracking**: Monitor baby's height, weight, and development
- **Feeding Tracker**: Log breastfeeding, bottle feeding, and solid foods
- **Sleep Monitoring**: Track sleep patterns and insights
- **Diaper Log**: Record diaper changes and patterns
- **Milestone Tracking**: Document important developmental milestones
- **Memory Journal**: Create and store precious memories with photos
- **Sanctuary**: Meditation and breathing exercises for mom's wellbeing

### 🎨 Design Features
- Modern, intuitive UI with custom fonts (Caveat, Nunito Sans, Playfair Display)
- Beautiful milestone images and icons
- Responsive design for various screen sizes
- Smooth animations and transitions

### 🛠 Technical Stack
- **Frontend**: React Native with TypeScript
- **Backend**: Convex for real-time data synchronization
- **Navigation**: Custom tab navigation
- **Styling**: Tailwind CSS for React Native
- **State Management**: React hooks and context
- **Media**: Image picker and camera integration

## Project Structure

```
moms_app/
├── the-story-of-us/          # Main React Native app
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── screens/          # App screens
│   │   ├── navigation/       # Navigation setup
│   │   ├── services/         # API and services
│   │   ├── hooks/           # Custom React hooks
│   │   └── utils/           # Utility functions
│   ├── convex/              # Backend configuration
│   └── assets/              # Images, fonts, and static assets
├── Our Story Mom App Htmls/ # HTML prototypes and designs
├── milestone_images/        # Milestone tracking images
├── diaper_images/          # Diaper tracking icons
├── fonts/                  # Custom fonts
└── docs/                   # Documentation
```

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- React Native development environment
- Expo CLI (optional, for easier development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd moms_app
```

2. Navigate to the app directory:
```bash
cd the-story-of-us
```

3. Install dependencies:
```bash
npm install
```

4. Set up Convex backend:
```bash
npx convex dev
```

5. Start the development server:
```bash
npm start
```

### Development

The app is built with React Native and uses Convex for backend services. The main application code is in the `the-story-of-us` directory.

Key development files:
- `App.tsx` - Main app component
- `src/navigation/AppNavigator.tsx` - Navigation setup
- `src/screens/` - All app screens
- `convex/` - Backend schema and functions

## Features in Detail

### 🍼 Feeding Tracker
- Track breastfeeding sessions with duration and side
- Log bottle feeding with amount and type
- Record solid food intake
- View feeding history and patterns

### 😴 Sleep Monitoring
- Active sleep timer
- Sleep pattern analysis
- Weekly and monthly insights
- Sleep quality tracking

### 📏 Growth Tracking
- Height and weight measurements
- Growth charts and percentiles
- Progress visualization
- Milestone correlation

### 🎯 Milestone Tracking
- Pre-defined developmental milestones
- Custom milestone creation
- Photo attachments
- Age-appropriate suggestions

### 🧘 Sanctuary (Mom's Wellbeing)
- Guided meditation library
- Breathing exercises
- Relaxation tools
- Self-care reminders

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact [your-email@example.com] or create an issue in the GitHub repository.

## Acknowledgments

- Design inspiration from modern parenting apps
- Icons and images from various sources
- Font families: Caveat, Nunito Sans, Playfair Display 