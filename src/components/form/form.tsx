"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { usePlacesContext } from "@/lib/placesContext";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  query: z.string().min(5, {
    message: "Query must be at least 5 characters.",
  }),
});

export default function MessageForm() {
  const { setPlaces } = usePlacesContext();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: values.query }),
      });

      if (response.status === 429) {
        const rateLimitData = (await response.json()) as RateLimitErrorResponse;

        const customMessage =
          rateLimitData.message || "You've made too many requests.";
        const description = `Please try again after ${new Date(
          rateLimitData.reset
        ).toLocaleTimeString()}.`;

        toast.error(customMessage, { description });

        return;
      }

      if (!response.ok) {
        throw new Error("Failed to send request");
      }

      const responseData = (await response.json()) as PlacesSearchResults;

      setPlaces(responseData.results);

      toast.success(
        "There are " + responseData.total + " places matching your query."
      );

      console.log("API Response", responseData);
    } catch (error) {
      toast.error("Error sending request");

      console.error("Error sending request", error);
    } finally {
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Find me a cheap sushi restaurant in downtown Los Angeles that's open now and has at least a 4-star rating."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={form.formState.isSubmitting || !form.formState.isDirty}
          className="cursor-pointer disabled:cursor-default"
        >
          {form.formState.isSubmitting ? "Sending..." : "Send"} Message
        </Button>
      </form>
    </Form>
  );
}
