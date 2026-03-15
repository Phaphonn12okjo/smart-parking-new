import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { clsx } from "clsx";

export const PaymentModal = ({
  isOpen,
  onClose,
  selectedSpot,
  malls,
  onConfirm,
}) => {
  const [paymentMethod, setPaymentMethod] = useState("promptpay");
  const selectedMall = malls.find((m) => m.id === selectedSpot?.mallId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      backdrop="blur"
      className="dark bg-[#141b3d]/95 backdrop-blur-3xl border border-white/20 rounded-[40px]"
    >
      <ModalContent className="p-4">
        <ModalHeader className="text-3xl font-bold font-['Bai_Jamjuree']">
          ຊຳລະເງິນ
        </ModalHeader>
        <ModalBody>
          <div className="bg-black/30 rounded-3xl p-6 space-y-4 mb-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="text-white/60">ທີ່ຈອດ VIP</span>
              <span className="font-bold">
                {selectedMall?.name} - {selectedSpot?.spotId}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="text-white/60">ໄລຍະເວລາ</span>
              <span className="font-bold">3 ຊົ່ວໂມງ</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-white/60">ຍອດລວມທັງໝົດ</span>
              <span className="text-3xl font-bold text-green-400">100 ກີບ</span>
            </div>
          </div>

          <div className="space-y-3">
            <div
              className={clsx(
                "p-5 border-2 rounded-2xl flex items-center gap-4 cursor-pointer transition-all",
                paymentMethod === "promptpay"
                  ? "bg-blue-500/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                  : "bg-white/5 border-transparent hover:border-white/10",
              )}
              onClick={() => setPaymentMethod("promptpay")}
            >
              <span className="text-4xl">💳</span>
              <span
                className={clsx(
                  "text-xl font-bold transition-colors",
                  paymentMethod === "promptpay"
                    ? "text-white"
                    : "text-white/40",
                )}
              >
                PromptPay
              </span>
            </div>
            <div
              className={clsx(
                "p-5 border-2 rounded-2xl flex items-center gap-4 cursor-pointer transition-all",
                paymentMethod === "card"
                  ? "bg-blue-500/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                  : "bg-white/5 border-transparent hover:border-white/10",
              )}
              onClick={() => setPaymentMethod("card")}
            >
              <span className="text-4xl">💰</span>
              <span
                className={clsx(
                  "text-xl font-bold transition-colors",
                  paymentMethod === "card" ? "text-white" : "text-white/40",
                )}
              >
                ບັດເຄດິດ
              </span>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            className="w-full h-16 text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 shadow-xl rounded-2xl"
            onClick={onConfirm}
          >
            ຢືນຢັນການຊຳລະເງິນ
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
