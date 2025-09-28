import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Typography } from '@/components/UI/Typography';
import { Button } from '@/components/UI/Button';

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  difficulty: string;
  time: string;
  mistakes: number;
}

interface ConfettiPiece {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  scale: Animated.Value;
  color: string;
}

const { width, height } = Dimensions.get('window');

const COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

export function SuccessModal({ visible, onClose, difficulty, time, mistakes }: SuccessModalProps) {
  const confettiPieces = useRef<ConfettiPiece[]>([]);
  const modalScale = useRef(new Animated.Value(0)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Create confetti pieces
      confettiPieces.current = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: new Animated.Value(Math.random() * width),
        y: new Animated.Value(-50),
        rotation: new Animated.Value(0),
        scale: new Animated.Value(1),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));

      // Animate modal entrance
      Animated.parallel([
        Animated.spring(modalScale, {
          toValue: 1,
          tension: 100,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate confetti
      const confettiAnimations = confettiPieces.current.map((piece) => {
        return Animated.parallel([
          Animated.timing(piece.y, {
            toValue: height + 100,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(piece.x, {
            toValue: (piece.x as any)._value + (Math.random() - 0.5) * 200,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.loop(
            Animated.timing(piece.rotation, {
              toValue: 360,
              duration: 1000 + Math.random() * 1000,
              useNativeDriver: true,
            })
          ),
        ]);
      });

      Animated.parallel(confettiAnimations).start();
    } else {
      // Reset animations
      modalScale.setValue(0);
      modalOpacity.setValue(0);
    }
  }, [visible]);

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy': return '#27ae60';
      case 'normal': return '#f39c12';
      case 'hard': return '#e74c3c';
      default: return '#3498db';
    }
  };

  const getPerformanceMessage = () => {
    if (mistakes === 0) return 'Perfect! No mistakes! 🌟';
    if (mistakes <= 2) return 'Excellent! Well done! 🎉';
    if (mistakes <= 5) return 'Good job! Keep improving! 👏';
    return 'Completed! Practice makes perfect! 💪';
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Confetti */}
        {confettiPieces.current.map((piece) => (
          <Animated.View
            key={piece.id}
            style={[
              styles.confettiPiece,
              {
                backgroundColor: piece.color,
                transform: [
                  { translateX: piece.x },
                  { translateY: piece.y },
                  {
                    rotate: piece.rotation.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                  { scale: piece.scale },
                ],
              },
            ]}
          />
        ))}

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: modalScale }],
              opacity: modalOpacity,
            },
          ]}
        >
          <View style={styles.modalContent}>
            {/* Trophy Icon */}
            <View style={styles.trophyContainer}>
              <Typography variant="title" style={styles.trophy}>🏆</Typography>
            </View>

            {/* Title */}
            <Typography variant="title" style={styles.title}>
              Puzzle Completed!
            </Typography>

            {/* Performance Message */}
            <Typography variant="body" style={styles.performanceMessage}>
              {getPerformanceMessage()}
            </Typography>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() }]}>
                <Typography variant="caption" style={styles.difficultyText}>
                  {difficulty.toUpperCase()}
                </Typography>
              </View>

              <View style={styles.statRow}>
                <Typography variant="body" style={styles.statLabel}>Time:</Typography>
                <Typography variant="body" style={styles.statValue}>{time}</Typography>
              </View>

              <View style={styles.statRow}>
                <Typography variant="body" style={styles.statLabel}>Mistakes:</Typography>
                <Typography variant="body" style={styles.statValue}>{mistakes}</Typography>
              </View>
            </View>

            {/* Action Button */}
            <Button
              title="Continue"
              onPress={onClose}
              variant="success"
              size="large"
              style={styles.continueButton}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiPiece: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  trophyContainer: {
    marginBottom: 20,
  },
  trophy: {
    fontSize: 60,
  },
  title: {
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  performanceMessage: {
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 25,
  },
  statsContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  difficultyBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  difficultyText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  statLabel: {
    color: '#7f8c8d',
    fontWeight: '500',
  },
  statValue: {
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  continueButton: {
    width: '100%',
  },
});