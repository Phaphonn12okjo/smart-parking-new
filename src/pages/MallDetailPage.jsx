import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDisclosure } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { clsx } from "clsx";

// Config & Data
import { initialMalls, initialSpots } from "@/config/parking-data";

// Components
import { PaymentModal } from "@/components/parking/PaymentModal";

// MQTT
import { useMqtt } from "@/mqtt/mqtt";

// Supabase
import { supabase } from "@/config/supabase";

export default function MallDetailPage() {
  const { id: mallId } = useParams();
  const navigate = useNavigate();

  const { mqttData, isBoardConnected, publishGateCommand } = useMqtt(mallId);
  const [parkingSpots, setParkingSpots] = useState(initialSpots);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [activeReservation, setActiveReservation] = useState(null);
  const [isGateOpen, setIsGateOpen] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Load mall data
  const mall = useMemo(
    () => initialMalls.find((m) => m.id === mallId),
    [mallId],
  );

  // Sync MQTT data to state (Only VIP)
  useEffect(() => {
    if (mqttData && mallId === "my-project") {
      setParkingSpots((prev) => {
        const spots = [...(prev["my-project"] || [])];
        if (spots[0]) spots[0].status = mqttData.spot1;
        if (spots[1]) spots[1].status = mqttData.spot2;
        if (spots[2]) spots[2].status = mqttData.vipSpot;
        return { ...prev, ["my-project"]: spots };
      });
      setIsGateOpen(mqttData.gateStatus === "open");
    }
  }, [mqttData, mallId]);

  // Sync active reservations from Supabase
  useEffect(() => {
    if (!mall) {
      navigate("/");
      return;
    }

    const syncReservations = async () => {
      // 1. Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // 2. Fetch from Supabase
      const { data: dbReservations } = await supabase
        .from("reservations")
        .select("*")
        .eq("user_id", user.id)
        .eq("mall_id", mallId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (dbReservations && dbReservations.length > 0) {
        const res = dbReservations[0];
        const lastRes = {
          id: res.id,
          mallId: res.mall_id,
          spotId: res.spot_id,
          timestamp: new Date(res.created_at).toLocaleString("th-TH"),
          remainingUses: 3,
          gateOpen: res.gate_open,
        };

        setActiveReservation(lastRes);
        setIsGateOpen(lastRes.gateOpen || false);
        setHasPaid(true);

        setParkingSpots((prev) => {
          const mallSpots = [...(prev[mallId] || [])];
          const index = mallSpots.findIndex((s) => s.id === lastRes.spotId);
          if (index !== -1)
            mallSpots[index] = { ...mallSpots[index], reserved: true };
          return { ...prev, [mallId]: mallSpots };
        });
      }
    };

    syncReservations();
  }, [mall, navigate, mallId]);

  const handleSelectSpot = (mId, sId) => {
    setSelectedSpot({ mallId: mId, spotId: sId });
    onOpen();
  };

  const handleGateControl = async (open) => {
    publishGateCommand(open ? "open" : "close");
    setIsGateOpen(open);
    if (activeReservation) {
      // Update Supabase
      await supabase
        .from("reservations")
        .update({ gate_open: open })
        .eq("id", activeReservation.id);

      setActiveReservation({ ...activeReservation, gateOpen: open });
    }
  };

  const cancelReservation = async () => {
    if (!activeReservation) return;

    const { mallId: mId, spotId: sId } = activeReservation;

    // Remove from Supabase
    await supabase.from("reservations").delete().eq("id", activeReservation.id);

    // Update spot status
    setParkingSpots((prev) => {
      const mallSpots = [...(prev[mId] || [])];
      const index = mallSpots.findIndex((s) => s.id === sId);
      if (index !== -1)
        mallSpots[index] = { ...mallSpots[index], reserved: false };
      return { ...prev, [mId]: mallSpots };
    });

    // Reset states
    setActiveReservation(null);
    setHasPaid(false);
    setIsGateOpen(false);
  };

  const confirmPayment = async () => {
    if (!selectedSpot) return;

    const { mallId: mId, spotId: sId } = selectedSpot;

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Save to Supabase
    const { data: dbData, error: dbError } = await supabase
      .from("reservations")
      .insert([
        {
          mall_id: mId,
          spot_id: sId,
          user_id: user.id,
          gate_open: false,
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error("Supabase Error:", dbError);
      return;
    }

    const newReservation = {
      id: dbData.id,
      mallId: mId,
      spotId: sId,
      timestamp: new Date().toLocaleString("th-TH"),
      remainingUses: 3,
      gateOpen: false,
    };

    setParkingSpots((prev) => {
      const spots = [...(prev[mId] || [])];
      const index = spots.findIndex((s) => s.id === sId);
      if (index !== -1) spots[index] = { ...spots[index], reserved: true };
      return { ...prev, [mId]: spots };
    });

    setActiveReservation(newReservation);
    setIsGateOpen(false);
    setHasPaid(true);
    onClose();
  };

  if (!mall) return null;

  const spots = parkingSpots[mallId] || [];

  return (
    <main className="animate-fadeIn space-y-6">
      {hasPaid && activeReservation && (
        <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-blue-500/30 rounded-3xl overflow-hidden animate-slideIn">
          <CardBody className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="space-y-2 text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <h3 className="text-2xl font-bold font-['Bai_Jamjuree']">
                    ຄວບຄຸ່ມປະຕູ (ຈຸດຈອດ {activeReservation.spotId})
                  </h3>
                  <Button
                    className="h-14 px-8 rounded-2xl font-bold text-lg transition-all bg-red-600/20 hover:bg-red-600 text-white border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                    onClick={cancelReservation}
                  >
                    ຍົກເລີກການຈອງ
                  </Button>
                </div>
                <p className="text-white/60">
                  ສະຖານະປະຈຸບັນ:
                  <span
                    className={clsx(
                      "font-bold",
                      isGateOpen ? "text-green-400" : "text-red-400",
                    )}
                  >
                    {isGateOpen ? "ເປີດຢູ່" : "ປິດຢູ່"}
                  </span>
                </p>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <Button
                  className={clsx(
                    "flex-1 md:flex-none h-14 px-8 rounded-2xl font-bold text-lg transition-all",
                    isGateOpen
                      ? "bg-white/10 text-white/40 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]",
                  )}
                  disabled={isGateOpen}
                  onClick={() => handleGateControl(true)}
                >
                  ເປີດປະຕູ
                </Button>
                <Button
                  className={clsx(
                    "flex-1 md:flex-none h-14 px-8 rounded-2xl font-bold text-lg transition-all",
                    !isGateOpen
                      ? "bg-white/10 text-white/40 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]",
                  )}
                  disabled={!isGateOpen}
                  onClick={() => handleGateControl(false)}
                >
                  ປິດປະຕູ
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <Card className="bg-[#141b3d]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <h2 className="text-3xl font-bold font-['Bai_Jamjuree'] flex items-center gap-3">
            {mall.icon} {mall.name}
            <div className="flex items-center gap-2 ml-4">
              <div
                className={clsx(
                  "w-3 h-3 rounded-full animate-pulse",
                  isBoardConnected
                    ? "bg-green-500 shadow-[0_0_10px_#22c55e]"
                    : "bg-red-500 shadow-[0_0_10px_#ef4444]",
                )}
              />
              <span
                className={clsx(
                  "text-xs font-semibold px-2 py-1 rounded-full border",
                  isBoardConnected
                    ? "text-green-400 border-green-500/30 bg-green-500/10"
                    : "text-red-400 border-red-500/30 bg-red-500/10",
                )}
              >
                {isBoardConnected ? "BOARD ONLINE" : "BOARD OFFLINE"}
              </span>
            </div>
          </h2>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-6 p-6 bg-black/20 rounded-2xl mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 border-2 border-green-500" />
            <span className="text-sm font-semibold">ວ່າງ</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border-2 border-red-500" />
            <span className="text-sm font-semibold">ບໍ່ວ່າງ</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border-2 border-yellow-500" />
            <span className="text-sm font-semibold">VIP</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 border-2 border-orange-500" />
            <span className="text-sm font-semibold">ຈອງແລ້ວ</span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {spots.map((spot) => {
            const isReserved = spot.type === "vip" && spot.reserved;
            const isOccupied = spot.status === "occupied";
            const isVip = spot.type === "vip";

            const statusClass = clsx(
              "aspect-square rounded-2xl border-4 flex flex-col items-center justify-center gap-3 transition-all relative overflow-hidden group",
              isReserved
                ? "bg-orange-500/10 border-orange-500 text-orange-500 cursor-default"
                : isOccupied
                  ? "bg-red-500/10 border-red-500 text-red-500 cursor-not-allowed"
                  : isVip
                    ? "bg-yellow-500/10 border-yellow-500 text-yellow-500 hover:translate-y-[-5px] hover:shadow-[0_10px_30px_rgba(255,215,0,0.3)]"
                    : "bg-green-500/10 border-green-500 text-green-500",
            );

            const canBook = isVip && !isReserved && !isOccupied;

            return (
              <div
                key={spot.id}
                className={statusClass}
                onClick={() => canBook && handleSelectSpot(mall.id, spot.id)}
              >
                {isVip && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-[10px] font-bold px-2 py-1 rounded-md">
                    VIP
                  </div>
                )}
                <span className="text-5xl font-bold font-['Bai_Jamjuree']">
                  {spot.id}
                </span>
                <span className="text-sm font-bold uppercase tracking-widest">
                  {isReserved ? "ຈອງແລ້ວ" : isOccupied ? "ບໍ່ວ່າງ" : "ວ່າງ"}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <PaymentModal
        isOpen={isOpen}
        malls={initialMalls}
        selectedSpot={selectedSpot}
        onClose={onClose}
        onConfirm={confirmPayment}
      />
    </main>
  );
}
