import React, { useState } from "react";
import { formatCurrency } from "@/lib/formatters";

export default function ChangeCalculatorModal({
  isOpen,
  onClose,
  total,
}: {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}) {
  const [amountGiven, setAmountGiven] = useState<number | string>("");
  const [change, setChange] = useState<number | null>(null);

  const handleAmountChange = (value: string) => {
    setAmountGiven(value);
    const numericAmountGiven = parseFloat(value);
    if (!isNaN(numericAmountGiven)) {
      const totalInCents = total * 100; // Convert total to cents
      const calculatedChange = numericAmountGiven - totalInCents;
      setChange(calculatedChange);
    } else {
      setChange(null);
    }
  };

  return (
    isOpen && (
      <div className=" fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm font-montserrat">
          <h2 className="text-2xl font-gotham tracking-wider mb-4">Calculate Change</h2>
          <div className="space-y-4">

            <div >
              <label htmlFor="amountGiven" className="block text-sm font-medium">
                Recieved (in cents):
                <span className="text-gray-800">
                  {amountGiven ? formatCurrency(parseInt(String(amountGiven)) / 100) : "$0.00"}
                </span>
              </label>

              <input
                type="number"
                id="amountGiven"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={amountGiven}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="Enter amount customer gives in cents"
              />
            </div>
            <div>
              <p className="text-sm font-montserrat">
                Total: <span className="text-gray-800">{formatCurrency(total)}</span>
              </p>

            </div>
              <div className="mt-4">
                <p className="font-montserrat">
                  Change to Return:{" "}
                  <span className="text-blue-400">
                    {change !== null && change >= 0
                      ? formatCurrency(change / 100)
                      : "-"}
                  </span>
                </p>
              </div>
  
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full py-2 bg-gray-200 text-gray-800 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    )
  );
}
