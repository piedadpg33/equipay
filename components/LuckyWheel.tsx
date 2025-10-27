import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Dimensions, Easing, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Defs, G, Path, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');
// Tamaño más pequeño para modal
const WHEEL_SIZE = Math.min(width * 0.6, 320);
const CENTER = WHEEL_SIZE / 2;
const RADIUS = WHEEL_SIZE / 2;

export interface LuckyWheelProps {
  segments: string[];
  onFinish: (winner: string, index: number) => void;
}

const colors = [
  '#c77ac7ff', '#76b9e7ff', '#325d71ff',
  '#FFCCBC', '#D7CCC8', '#CFD8DC', '#F8BBD0', '#DCEDC8', '#B3E5FC', '#D1C4E9', '#FFF9C4', '#B2DFDB', '#F0F4C3', '#B3E5FC', '#E1BEE7',
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#F44336', '#8BC34A', '#00BCD4', '#FFC107',
  '#E91E63', '#3F51B5', '#009688', '#FF5722', '#673AB7', '#CDDC39', '#03A9F4', '#FFEB3B', '#9C27B0', '#4CAF50',
  '#2196F3', '#FF9800', '#795548', '#607D8B', '#FFCDD2', '#C8E6C9', '#BBDEFB', '#D1C4E9', '#FFF9C4', '#B2DFDB', '#F0F4C3', '#B3E5FC', '#E1BEE7',
  '#FFCCBC', '#D7CCC8', '#CFD8DC', '#F8BBD0', '#DCEDC8', '#B3E5FC', '#D1C4E9', '#FFF9C4', '#B2DFDB', '#F0F4C3', '#B3E5FC', '#E1BEE7'
];

function createWheelPaths(segments: string[]) {
  const angle = 360 / segments.length;
  let paths = [];
  for (let i = 0; i < segments.length; i++) {
    const startAngle = angle * i;
    const endAngle = angle * (i + 1);
    const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
    const x1 = CENTER + RADIUS * Math.cos((Math.PI * startAngle) / 180);
    const y1 = CENTER + RADIUS * Math.sin((Math.PI * startAngle) / 180);
    const x2 = CENTER + RADIUS * Math.cos((Math.PI * endAngle) / 180);
    const y2 = CENTER + RADIUS * Math.sin((Math.PI * endAngle) / 180);
    const d = [
      `M ${CENTER} ${CENTER}`,
      `L ${x1} ${y1}`,
      `A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');
    paths.push({ d, color: colors[i % colors.length], label: segments[i], midAngle: startAngle + angle / 2 });
  }
  return paths;
}

const LuckyWheel: React.FC<LuckyWheelProps> = ({ segments, onFinish }) => {
  const { t } = useTranslation();
  const [spinning, setSpinning] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const rotation = useRef(new Animated.Value(0)).current;
  const wheelPaths = createWheelPaths(segments);

  // La flecha está abajo, así que el segmento ganador debe alinearse con 270° (abajo)
  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    const winner = Math.floor(Math.random() * segments.length);
    setWinnerIndex(winner);
    const anglePerSegment = 360 / segments.length;
    // Para alinear el centro del segmento ganador con 270° (abajo)
    const winnerAngle = winner * anglePerSegment + anglePerSegment / 2;
    const rotateTo = 360 * 5 + (270 - winnerAngle);
    Animated.timing(rotation, {
      toValue: rotateTo,
      duration: 4000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setSpinning(false);
      onFinish(segments[winner], winner);
      rotation.setValue(rotateTo % 360);
    });
  };

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={{ alignItems: 'center', marginVertical: 8, width: WHEEL_SIZE + 10 }}>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        {/* Flecha de ganador mejorada, apuntando hacia abajo */}
        <Svg width={28} height={28} style={{ position: 'absolute', top: -18, left: CENTER - 14, zIndex: 10 }}>
          <G>
            <Path d="M14 26 L24 6 L4 6 Z" fill="#111" stroke="#fff" strokeWidth={2} />
          </G>
        </Svg>
        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
          <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
            <Defs>
              <RadialGradient id="goldBorder" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#7a21b6ff" />
                <Stop offset="60%" stopColor="#710e7aff" />
                <Stop offset="100%" stopColor="#691469ff" />
              </RadialGradient>
            </Defs>
            <G>
              {/* Borde exterior premium: doble trazo */}
              <Path
                d={`M ${CENTER} ${CENTER} m -${RADIUS},0 a ${RADIUS},${RADIUS} 0 1,0 ${WHEEL_SIZE},0 a ${RADIUS},${RADIUS} 0 1,0 -${WHEEL_SIZE},0`}
                fill="#ffffffff"
                stroke="url(#goldBorder)"
                strokeWidth={6}
              />
              <Path
                d={`M ${CENTER} ${CENTER} m -${RADIUS - 8},0 a ${RADIUS - 8},${RADIUS - 8} 0 1,0 ${WHEEL_SIZE - 16},0 a ${RADIUS - 8},${RADIUS - 8} 0 1,0 -${WHEEL_SIZE - 16},0`}
                fill="none"
                stroke="#fff"
                strokeWidth={3}
                opacity={0.8}
              />
              {/* Slices */}
              {wheelPaths.map((path, i) => (
                <Path key={i} d={path.d} fill={path.color} />
              ))}
              {/* Etiquetas */}
              {wheelPaths.map((path, i) => {
                const angle = (Math.PI * path.midAngle) / 180;
                const x = CENTER + (RADIUS * 0.65) * Math.cos(angle);
                const y = CENTER + (RADIUS * 0.65) * Math.sin(angle);
                return (
                  <SvgText
                    key={i}
                    x={x}
                    y={y}
                    fill="#fff"
                    fontSize={13}
                    fontWeight="bold"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {path.label}
                  </SvgText>
                );
              })}
              {/* Círculo central decorativo */}
              <Path
                d={`M ${CENTER} ${CENTER} m -24,0 a 24,24 0 1,0 48,0 a 24,24 0 1,0 -48,0`}
                fill="#4d4970ff"
                stroke="#382458ff"
                strokeWidth={1}
              />
            </G>
          </Svg>
        </Animated.View>
      </View>
      <TouchableOpacity 
        style={styles.button} 
        onPress={spin} 
        disabled={spinning}
        accessibilityRole="button"
        accessibilityLabel={spinning ? t('wheel.spinningAria', 'Spinning the wheel') : t('wheel.spinAria', 'Spin the wheel')}
        accessibilityHint={t('wheel.spinHint', 'Tap to randomly select a name')}
      >
        <Text style={styles.buttonText}>{spinning ? t('wheel.spinning') : t('wheel.spin')}</Text>
      </TouchableOpacity>
      {winnerIndex !== null && !spinning && (
        <Text style={{ marginTop: 10, fontSize: 16, fontWeight: 'bold', color: '#cb3325ff' }}>
          {t('wheel.winner', { name: segments[winnerIndex] })}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pointer: {
    position: 'absolute',
    left: '50%',
    marginLeft: -12,
    width: 24,
    height: 24,
    backgroundColor: 'red',
    borderRadius: 12,
    zIndex: 2,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  button: {
    marginTop: 24,
    backgroundColor: '#36A2EB',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default LuckyWheel;
