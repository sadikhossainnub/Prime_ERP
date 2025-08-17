import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PipelineChartProps {
  data: { name: string; value: number; color: string }[];
}

const PipelineChart: React.FC<PipelineChartProps> = ({ data }) => {
  return (
    <View style={styles.container}>
      {data.map((item, index) => (
        <View key={index} style={[styles.bar, { backgroundColor: item.color }]} >
          <Text style={styles.label}>{`${item.name}: ${item.value}`}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 10,
  },
  bar: {
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default PipelineChart;
