"use client";
import React, { useState, useEffect } from "react";
import { useUser } from "@/app/provider/user-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/utils";
import { format } from "date-fns";

export default function SettingsPage() {
  const { userData, dispatch } = useUser();
  const [formData, setFormData] = useState({
    full_name: userData?.full_name || "",
    email: userData?.email || "",
    sol_address: userData?.sol_address || "",
    eth_address: userData?.eth_address || "",
    webhook_url: userData?.webhook_url || "",
    is_active: userData?.is_active || false,
    api_key_expiry: userData?.api_key_expiry || "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);

    setTimeout(() => {
      setCopied(null);
    }, 2000);

    toast.success(`${label} copied`, {
      position: "bottom-right",
      duration: 2000,
    });
  };

  const saveChanges = async () => {
    try {
      setIsLoading(true);

      const response = await api.patch("/merchant/update", {
        full_name: formData.full_name,
        webhook: formData.webhook_url,
      });
      if (userData) {
        dispatch({
          type: "SET_USER",
          payload: {
            ...userData,
            full_name: formData.full_name,
            webhook_url: formData.webhook_url,
          },
        });
      }
      if (response.status === 200) {
        toast.success("Settings saved successfully");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const apiKeyExpiryDate = userData?.api_key_expiry
    ? format(new Date(userData.api_key_expiry), "MMMM d, yyyy")
    : "Not available";

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-white to-gray-50">
      <div className="flex flex-1 flex-col gap-8 w-full pb-12">
        {/* Profile Section */}
        <div className="space-y-5 px-8 pt-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Profile Information
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Manage your personal information and account settings
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex flex-col items-center gap-3">
                <Avatar className="h-20 w-20 rounded-full border-2 bg-gradient-to-br from-blue-50 to-indigo-100">
                  <AvatarImage
                    src={`https://avatar.tobi.sh/${userData?.full_name.slice(
                      0,
                      1
                    )}.svg?text=${userData?.full_name
                      .slice(0, 2)
                      .toUpperCase()}&size=512`}
                    alt={userData?.full_name}
                  />
                  <AvatarFallback className="rounded-full text-xl font-medium bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    {userData?.full_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2 group">
                    <Label
                      htmlFor="full_name"
                      className="text-gray-700 font-medium group-focus-within:text-primary"
                    >
                      Full Name
                    </Label>
                    <div className="relative">
                      <Input
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className="pr-20 border-gray-100 focus:border-primary/50 focus:ring-primary/10 h-10 transition-all rounded-xl"
                      />
                      <button
                        onClick={saveChanges}
                        disabled={isLoading}
                        className={`absolute right-1 top-1 inline-flex items-center justify-center gap-1.5 text-sm h-8 px-3 rounded-lg ${
                          isLoading
                            ? "bg-gray-100 text-gray-500"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Saving...
                          </>
                        ) : (
                          "Save"
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 group">
                    <Label
                      htmlFor="email"
                      className="text-gray-700 font-medium group-focus-within:text-primary"
                    >
                      Email Address
                    </Label>
                    <Input
                      disabled
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="border-gray-100 focus:border-primary/50 focus:ring-primary/10 h-10 transition-all rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* API Key Section */}
        <div className="space-y-5 px-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">API Key</h2>
            <p className="text-gray-500 text-sm mt-1">
              Your API key for accessing the platform programmatically
            </p>
          </div>

          <div className="">
            <div className="relative">
              <Input
                readOnly
                value={userData?.api_key || "••••••••••••••••••••••••••••••••"}
                className="pr-20 font-mono text-sm bg-gray-50/70 border-gray-100 h-10 rounded-xl"
              />
              <button
                className={`absolute right-1 top-1 inline-flex items-center justify-center gap-1.5 text-sm h-8 px-3 rounded-lg ${
                  copied === "API Key"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() =>
                  userData?.api_key &&
                  copyToClipboard(userData.api_key, "API Key")
                }
              >
                {copied === "API Key" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied === "API Key" ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-xs mt-3 flex items-center">
                Keep your API key secure and never share it publicly
              </p>
              <p className="text-gray-600 text-xs mt-3 flex items-center">
                <span className="font-semibold mr-1">Expires:</span>{" "}
                {apiKeyExpiryDate}
              </p>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Wallet Addresses Section */}
        <div className="space-y-5 px-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Wallet Addresses
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Your connected blockchain wallet addresses
            </p>
          </div>

          <div className="space-y-4">
            {/* SOL Address */}
            <div>
              <Label
                htmlFor="sol_address"
                className="text-gray-700 font-medium block mb-2"
              >
                Solana Address
              </Label>
              <div className="relative">
                <Input
                  readOnly
                  id="sol_address"
                  value={formData.sol_address || "Not connected"}
                  className="pr-20 font-mono text-sm bg-gray-50/70 border-gray-100 h-10 rounded-xl"
                />
                {formData.sol_address && (
                  <button
                    className={`absolute right-1 top-1 inline-flex items-center justify-center gap-1.5 text-sm h-8 px-3 rounded-lg ${
                      copied === "SOL Address"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() =>
                      copyToClipboard(formData.sol_address, "SOL Address")
                    }
                  >
                    {copied === "SOL Address" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied === "SOL Address" ? "Copied" : "Copy"}
                  </button>
                )}
              </div>
            </div>

            {/* ETH Address */}
            <div>
              <Label
                htmlFor="eth_address"
                className="text-gray-700 font-medium block mb-2"
              >
                Ethereum Address
              </Label>
              <div className="relative">
                <Input
                  readOnly
                  id="eth_address"
                  value={formData.eth_address || "Not connected"}
                  className="pr-20 font-mono text-sm bg-gray-50/70 border-gray-100 h-10 rounded-xl"
                />
                {formData.eth_address && (
                  <button
                    className={`absolute right-1 top-1 inline-flex items-center justify-center gap-1.5 text-sm h-8 px-3 rounded-lg ${
                      copied === "ETH Address"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() =>
                      copyToClipboard(formData.eth_address, "ETH Address")
                    }
                  >
                    {copied === "ETH Address" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied === "ETH Address" ? "Copied" : "Copy"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Webhook URL Section */}
        <div className="space-y-5 px-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Webhook Settings
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Configure a webhook URL to receive notifications
            </p>
          </div>

          <div className="">
            <div className="relative">
              <Input
                id="webhook_url"
                name="webhook_url"
                type="url"
                placeholder="https://your-service.com/webhook"
                value={formData.webhook_url}
                onChange={handleChange}
                className="pr-20 font-mono text-sm bg-gray-50/70 border-gray-100 h-10 transition-all rounded-xl"
              />
              <button
                onClick={saveChanges}
                disabled={isLoading}
                className={`absolute right-1 top-1 inline-flex items-center justify-center gap-1.5 text-sm h-8 px-3 rounded-lg ${
                  isLoading
                    ? "bg-gray-100 text-gray-500"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-3 flex items-center">
              We'll send event notifications to this URL when important events
              occur
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
