"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { DeliveryFeeTypes, DeliveryFeeType } from "@/lib/deliveryFeeTypes";
import { addDeliveryFeeConfig, updateDeliveryFeeConfig, deleteCustomRule } from "../_actions/prices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminPricesPage({
  config,
}: {
  config: { basePostalCode: string; type: DeliveryFeeType; distanceFeePerKm?: number; customRules?: { id: string; postalCodePrefix: string; feeInCents: number }[] };
}) {
  const [type, setType] = useState<DeliveryFeeType>(config?.type || DeliveryFeeTypes.DISTANCE);
  const [basePostalCode, setBasePostalCode] = useState<string>(config?.basePostalCode || "");
  const [distanceFeePerKm, setDistanceFeePerKm] = useState<number>(config?.distanceFeePerKm || 0);
  const [customRules, setCustomRules] = useState<
    Array<{ postalCodePrefix: string; feeInCents: number; id?: string }>
  >(config?.customRules || []);
  const [newRule, setNewRule] = useState<{ postalCodePrefix: string; feeInCents: number }>({
    postalCodePrefix: "",
    feeInCents: 0,
  });

  const { pending } = useFormStatus();

  const handleSaveConfig = async () => {
    const data = {
      basePostalCode,
      type,
      distanceFeePerKm,
      customRules,
    };
    if (config) {
      await updateDeliveryFeeConfig(data); // Server action to update config
    } else {
      await addDeliveryFeeConfig(data); // Server action to add new config
    }
  };

  const handleAddRule = () => {
    setCustomRules([...customRules, { ...newRule }]);
    setNewRule({ postalCodePrefix: "", feeInCents: 0 });
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (ruleId) {
      await deleteCustomRule(ruleId); // Server action to delete custom rule
    }
    setCustomRules(customRules.filter((rule) => rule.id !== ruleId));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold mb-6">Manage Delivery Fees</h1>
      <div className="space-y-4">
        <div>
          <Label htmlFor="basePostalCode">Origin Postal Code</Label>
          <Input
            id="basePostalCode"
            value={basePostalCode}
            onChange={(e) => setBasePostalCode(e.target.value)}
          />
        </div>

        <div>
          <Label>Delivery Fee Type</Label>
          <Select value={type} onValueChange={(value) => setType(value as DeliveryFeeType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DeliveryFeeTypes.DISTANCE}>Distance-Based</SelectItem>
              <SelectItem value={DeliveryFeeTypes.CUSTOM}>Custom Rules</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {type === DeliveryFeeTypes.DISTANCE && (
          <div>
            <Label htmlFor="distanceFeePerKm">Fee per Km (in cents)</Label>
            <Input
              id="distanceFeePerKm"
              type="number"
              value={distanceFeePerKm}
              onChange={(e) => setDistanceFeePerKm(Number(e.target.value))}
            />
          </div>
        )}

        {type === DeliveryFeeTypes.CUSTOM && (
          <div>
            <h3 className="text-xl font-semibold mt-4">Custom Delivery Rules</h3>
            {customRules.map((rule, index) => (
              <div key={index} className="flex items-center space-x-4 mt-2">
                <div>
                  <Label>Postal Code Prefix</Label>
                  <Input value={rule.postalCodePrefix} readOnly />
                </div>
                <div>
                  <Label>Fee in Cents</Label>
                  <Input value={rule.feeInCents} readOnly />
                </div>
                {rule.id && (
                  <Button variant="destructive" onClick={() => handleDeleteRule(rule.id!)}>
                    Delete
                  </Button>
                )}
              </div>
            ))}

            <div className="flex items-center space-x-4 mt-4">
              <div>
                <Label>Postal Code Prefix</Label>
                <Input
                  value={newRule.postalCodePrefix}
                  onChange={(e) => setNewRule({ ...newRule, postalCodePrefix: e.target.value })}
                />
              </div>
              <div>
                <Label>Fee in Cents</Label>
                <Input
                  type="number"
                  value={newRule.feeInCents}
                  onChange={(e) => setNewRule({ ...newRule, feeInCents: Number(e.target.value) })}
                />
              </div>
              <Button onClick={handleAddRule}>Add Rule</Button>
            </div>
          </div>
        )}

        <Button onClick={handleSaveConfig} disabled={pending}>
          {pending ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
}
