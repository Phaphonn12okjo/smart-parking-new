import mqtt from "mqtt";
import { useEffect, useState, useCallback } from "react";
import { BROKER_CONFIG, MQTT_TOPICS } from "./data";

export const useMqtt = (mallId) => {
  const [client, setClient] = useState(null);
  const [mqttData, setMqttData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isBoardConnected, setIsBoardConnected] = useState(false);

  useEffect(() => {
    const mqttClient = mqtt.connect(BROKER_CONFIG.URL);

    mqttClient.on("connect", () => {
      setIsConnected(true);
      mqttClient.subscribe(MQTT_TOPICS.PARKING_STATUS);
      mqttClient.subscribe(MQTT_TOPICS.GATE_STATUS);
      mqttClient.subscribe(MQTT_TOPICS.BOARD_STATUS);
      setClient(mqttClient);
    });

    mqttClient.on("error", (err) => {
      console.error("MQTT Connection Error:", err);
      setIsConnected(false);
    });

    mqttClient.on("message", (topic, message) => {
      const payload = message.toString();

      if (topic === MQTT_TOPICS.PARKING_STATUS) {
        try {
          const data = JSON.parse(payload);
          setMqttData(data);
        } catch (e) {
          console.error("Error parsing MQTT parking data", e);
        }
      }

      if (topic === MQTT_TOPICS.GATE_STATUS) {
        setMqttData((prev) =>
          prev ? { ...prev, gateStatus: payload } : null,
        );
      }

      if (topic === MQTT_TOPICS.BOARD_STATUS) {
        setIsBoardConnected(payload === "online");
      }
    });

    return () => {
      mqttClient.end();
    };
  }, []);

  const publishGateCommand = useCallback(
    (command) => {
      if (client && isConnected) {
        client.publish(MQTT_TOPICS.GATE_CONTROL, command);
      }
    },
    [client, isConnected],
  );

  return { mqttData, isConnected, isBoardConnected, publishGateCommand };
};
