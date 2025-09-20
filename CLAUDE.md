# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native Sudoku game built with Expo, TypeScript, and EAS for deployment to Google Play Store and Apple App Store.

## Technology Stack

- **Framework**: React Native with Expo (SDK ~54.0.9)
- **Language**: TypeScript
- **Build & Deploy**: EAS (Expo Application Services)
- **Target Platforms**: iOS and Android

## Development Commands

```bash
# Start development server
npm start

# Start on specific platforms
npm run android
npm run ios
npm run web

# Build for production
eas build --platform all

# Submit to app stores
eas submit --platform all
```

## Project Structure

```
src/
├── components/
│   ├── Game/          # Game logic components
│   ├── Grid/          # Sudoku grid components
│   ├── Cell/          # Individual cell components
│   └── UI/            # Reusable UI components
├── screens/           # App screens
├── utils/             # Utility functions
├── types/             # TypeScript type definitions
└── constants/         # App constants and configuration
```

## Key Architecture

- **Game State**: Centralized game state management for Sudoku logic
- **Grid System**: 9x9 grid with 3x3 box validation
- **Component Hierarchy**: Modular components for grid, cells, and UI elements
- **Type Safety**: Comprehensive TypeScript types for game logic

## App Configuration

- **App Name**: Sudoku Master
- **Bundle ID**: sudoku-master
- **Orientation**: Portrait only
- **New Architecture**: Enabled for React Native
- **Platforms**: iOS (tablet support), Android (adaptive icons)

## Development Notes

- Uses Expo managed workflow for simplified development
- EAS configured for development, preview, and production builds
- Auto-increment version numbers for production builds
- TypeScript strict mode enabled