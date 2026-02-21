import React, { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { useNavigate } from "react-router-dom";

// Config & Data
import { initialMalls, initialSpots } from "@/config/parking-data";

export default function SmartParkingPage() {
  const navigate = useNavigate();
  const [malls, setMalls] = useState(initialMalls);
  const [parkingSpots] = useState(initialSpots);
  const [searchTerm] = useState("");

  useEffect(() => {
    setMalls((prevMalls) =>
      prevMalls.map((mall) => {
        const spots = parkingSpots[mall.id] || [];
        const available = spots.filter(
          (s) =>
            s.status === "available" && (s.type !== "vip" || !s.reserved),
        ).length;
        return { ...mall, availableSpots: available };
      }),
    );
  }, [parkingSpots]);

  const filteredMalls = useMemo(() => {
    return malls.filter((m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [malls, searchTerm]);

  const handleSelectMall = (id) => {
    navigate(`/mall/${id}`);
  };

  return (
    <main className="animate-fadeIn">
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMalls.map((mall) => (
            <Card
              key={mall.id}
              isPressable
              className="bg-[#141b3d]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:translate-y-[-8px] hover:border-blue-500 transition-all group"
              onClick={() => handleSelectMall(mall.id)}
            >
              <CardHeader className="p-0 h-48 relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-green-400/20">
                {mall.image ? (
                  <img
                    src={mall.image}
                    alt={mall.name}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <span className="text-6xl">{mall.icon}</span>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardHeader>
              <CardBody className="p-6">
                <h3 className="text-2xl font-bold mb-4 font-['Bai_Jamjuree']">
                  {mall.name}
                </h3>
                <div className="flex gap-6">
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">
                      ທີ່ວ່າງ
                    </p>
                    <p className="text-2xl font-bold text-green-400">
                      {mall.availableSpots}/{mall.totalSpots}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">
                      VIP
                    </p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {mall.vipSpots}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
