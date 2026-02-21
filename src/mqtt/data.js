export const BROKER_CONFIG = {
  URL: "ws://broker.mqttdashboard.com:8000/mqtt",
};

// Topics สำหรับ MQTT (ต้องตรงกับใน ESP32 ทุกตัวอักษร)
export const MQTT_TOPICS = {
  PARKING_STATUS: "parking/status",
  GATE_CONTROL: "parking/gate/control",
  GATE_STATUS: "parking/gate/status",
  BOARD_STATUS: "parking/board/status",
};

// ข้อมูลจำลองสำหรับเริ่มต้น (Mock Data)
export const initialMqttData = {
  spot1: "available",
  spot2: "occupied",
  vipSpot: "available",
  gateStatus: "closed",
};
