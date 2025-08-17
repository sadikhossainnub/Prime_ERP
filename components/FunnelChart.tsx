import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Polygon, Text as SvgText } from "react-native-svg";

interface FunnelChartProps {
  data: { name: string; value: number; color: string }[];
}

const FunnelChart: React.FC<FunnelChartProps> = ({ data }) => {
  const width = 300;
  const height = 200;
  const maxVal = Math.max(...data.map((d) => d.value));

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        {data.map((d, i) => {
          const topY = (i * height) / data.length;
          const bottomY = ((i + 1) * height) / data.length;
          const topX1 = (width * (1 - d.value / maxVal)) / 2;
          const topX2 = width - topX1;
          const bottomX1 =
            i + 1 < data.length
              ? (width * (1 - data[i + 1].value / maxVal)) / 2
              : topX1;
          const bottomX2 =
            i + 1 < data.length
              ? width - (width * (1 - data[i + 1].value / maxVal)) / 2
              : topX2;

          return (
            <Polygon
              key={i}
              points={`${topX1},${topY} ${topX2},${topY} ${bottomX2},${bottomY} ${bottomX1},${bottomY}`}
              fill={d.color}
            />
          );
        })}
        {data.map((d, i) => {
          const y = (i * height) / data.length + height / (data.length * 2);
          return (
            <SvgText
              key={i}
              x={width / 2}
              y={y}
              fill="#fff"
              fontSize="14"
              fontWeight="bold"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {`${d.name}: ${d.value}`}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default FunnelChart;
