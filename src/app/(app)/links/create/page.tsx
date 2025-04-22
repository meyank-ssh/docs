"use client";

import React, { useState } from "react";
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

export default function LinksPage() {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    description: "",
    minAmount: "",
    maxAmount: "",
    expiryDays: "30",
    redirectUrl: "",
    currency: "USD",
    payment_type: "",
  });

  const [linkCreated, setLinkCreated] = useState(false);
  const [paymentLink, setPaymentLink] = useState("");
  const [allowCustomAmount, setAllowCustomAmount] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [copying, setCopying] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Format data for API request
      const payload = {
        title: formData.title,
        amount: parseFloat(formData.amount),
        description: formData.description,
        redirect_url: formData.redirectUrl,
        payment_type: formData.payment_type,
        expiry: 10, // Convert days to hours: 7 days = 168 hours
      };

      // Make API call to create payment link
      const response = await api.post("/links/create", payload);

      // Handle successful response
      if (response.success) {
        // Add type assertion for the response data
        const linkData = response.data as { url?: string; ID?: string };
        const linkUrl =
          linkData.url || `${window.location.origin}/pay/${linkData.ID}`;

        setPaymentLink(linkUrl);
        setLinkCreated(true);
      }
    } catch (error) {
      console.error("Error creating payment link:", error);
      // You could add error handling with a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopying(true);
    setTimeout(() => {
      setCopying(false);
    }, 1500);
  };

  return (
    <div className="flex flex-1 flex-col bg-background/40">
      <div className="@container/main flex flex-1 flex-col">
        <div className="max-w-screen-2xl mx-auto w-full py-6 px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-start lg:grid-cols-3 gap-6">
            {/* Create Payment Link Card */}
            <Card className="lg:col-span-2 shadow-sm border-border/60">
              <CardHeader className="pb-0">
                <CardTitle>Create Payment Link</CardTitle>
                <CardDescription>
                  Generate a shareable payment link for your clients
                </CardDescription>
              </CardHeader>

              <CardContent>
                {!linkCreated ? (
                  <form onSubmit={handleCreateLink} className="space-y-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="title">Link Title</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="e.g. Premium Subscription"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="focus-visible:ring-primary/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        rows={3}
                        placeholder="Enter payment description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="focus-visible:ring-primary/30 min-h-23"
                      />
                      {/* <p className="text-xs text-muted-foreground mt-1">
                        This will be displayed to your customers at checkout
                      </p> */}
                    </div>

                    {/* <div className="p-4 rounded-lg bg-muted/40 border border-border/60">
                      <Label className="text-sm font-medium block mb-2">
                        Payment Methods
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {cryptoOptions.map((crypto) => (
                          <div
                            key={crypto.id}
                            onClick={() => handleCryptoToggle(crypto.id)}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${
                              selectedCryptos.includes(crypto.id)
                                ? "bg-primary/10 border border-primary/30"
                                : "bg-background border border-border hover:bg-muted"
                            }`}
                          >
                            <div className="flex-shrink-0">{crypto.icon}</div>
                            <span className="text-sm font-medium">
                              {crypto.name}
                            </span>
                          </div>
                        ))}
                      </div>
                      {selectedCryptos.length === 0 && (
                        <p className="text-xs text-destructive mt-2">
                          Select at least one cryptocurrency
                        </p>
                      )}
                    </div> */}
                    <div className="space-y-1.5">
                      <Label htmlFor="redirectUrl">
                        Redirect URL (optional)
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        This is the URL that the user will be redirected to
                        after the payment is complete.
                      </p>
                      <Input
                        id="redirectUrl"
                        name="redirectUrl"
                        placeholder="e.g. https://example.com"
                        value={formData.redirectUrl}
                        onChange={handleInputChange}
                        type="url"
                        className="focus-visible:ring-primary/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="webhookUrl">Webhook URL (optional)</Label>
                      <p className="text-xs text-muted-foreground">
                        This is the URL that will receive the payment status
                        updates.
                      </p>
                      {/* <Input
                        id="webhookUrl"
                        name="webhookUrl"
                        placeholder="e.g. https://example.com"
                        value={formData.webhookUrl}
                        onChange={handleInputChange}
                        type="url"
                        className="focus-visible:ring-primary/30"
                      /> */}
                    </div>
                    <div className="p-4 rounded-lg bg-muted/40 border border-border/60">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-foreground">
                          Amount Settings
                        </h3>
                        {/* Comment out custom amount toggle as requested
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="allowCustomAmount"
                            checked={allowCustomAmount}
                            onCheckedChange={() =>
                              setAllowCustomAmount(!allowCustomAmount)
                            }
                          />
                          <Label
                            htmlFor="allowCustomAmount"
                            className="text-sm text-muted-foreground cursor-pointer"
                          >
                            Allow custom amount
                          </Label>
                        </div>
                        */}
                      </div>

                      <div className="flex items-center gap-2">
                        <Select
                          value={formData.currency}
                          onValueChange={(value) =>
                            handleSelectChange("currency", value)
                          }
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue placeholder="Currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            {/* <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem> */}
                          </SelectContent>
                        </Select>
                        <Input
                          id="amount"
                          name="amount"
                          type="number"
                          placeholder="0.00"
                          value={formData.amount}
                          onChange={handleInputChange}
                          required
                          className="focus-visible:ring-primary/30"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/40 border border-border/60">
                      <Label className="text-sm font-medium block mb-2">
                        Link Settings
                      </Label>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="expiryDays"
                          className="text-xs text-muted-foreground"
                        >
                          Expiration
                        </Label>
                        <Select
                          value={formData.payment_type}
                          onValueChange={(value) =>
                            handleSelectChange("payment_type", value)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select expiration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PERMANENT">PERMANENT</SelectItem>
                            <SelectItem value="ONE_TIME">ONE_TIME</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating..." : "Create Payment Link"}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-5">
                    <div className="rounded-lg bg-muted/30 p-5 border border-border/60">
                      <Label className="text-sm font-medium block mb-3">
                        Payment Link Created
                      </Label>
                      <div className="flex items-center mb-2">
                        <input
                          type="text"
                          value={paymentLink}
                          readOnly
                          className="flex-1 bg-background rounded-l-md border border-border py-2 px-3 text-sm"
                        />
                        <Button
                          onClick={copyToClipboard}
                          variant="secondary"
                          className={`rounded-l-none relative overflow-hidden ${
                            copying
                              ? "bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/40"
                              : ""
                          }`}
                        >
                          <span
                            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
                              copying ? "opacity-100" : "opacity-0"
                            }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-green-600 dark:text-green-400"
                            >
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          </span>

                          <span
                            className={`transition-opacity duration-200 ${
                              copying ? "opacity-0" : "opacity-100"
                            }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect
                                x="9"
                                y="9"
                                width="13"
                                height="13"
                                rx="2"
                                ry="2"
                              ></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                          </span>
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Share this link with your customers to receive payments
                      </p>
                    </div>

                    <div className="rounded-lg bg-primary/5 p-4 border border-primary/20">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-primary/10 p-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-primary"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-foreground">
                            Your payment link is ready
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Customers can now make payments using
                            cryptocurrencies
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setLinkCreated(false)}
                      >
                        Create Another
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Features Card */}
            <Card className="shadow-sm border-border/60 self-start">
              <CardHeader className="pb-0">
                <CardTitle>Features & Benefits</CardTitle>
                <CardDescription>
                  Streamline your crypto payments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-md flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9.5 9.5h4.5a2 2 0 0 1 0 4h-4.5"></path>
                      <path d="M9.5 14.5h4.5a2 2 0 0 1 0 4h-4.5"></path>
                      <path d="M9.5 9.5v9"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">
                      Multi-Crypto Support
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Accept Ethereum, Bitcoin, and Solana with automatic USD
                      conversion rates
                    </p>
                  </div>
                </div>
                {/* 
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-md flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                      <path d="M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">
                      Flexible Pricing
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Set fixed prices or enable custom amounts with minimum and
                      maximum limits
                    </p>
                  </div>
                </div> */}

                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-md flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">
                      Shareable Links
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Share payment links via email, social media, or integrate
                      into your website
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-md flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">
                      Expiration Control
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Set custom expiration dates for time-limited offers and
                      promotions
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-md flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <rect
                        x="2"
                        y="3"
                        width="20"
                        height="14"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="8" y1="21" x2="16" y2="21"></line>
                      <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">
                      Instant Notifications
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Get real-time payment alerts and transaction confirmations
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" className="w-full text-sm">
                  View in test mode
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
