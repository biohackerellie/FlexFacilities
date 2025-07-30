"use client";

import type * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { formSchema } from "@local/validators";

import { Button } from "@/components/ui/buttons";
import { Card } from "@/components/ui/card";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  categoryChange,
  costChange,
  facilityChange,
} from "@/functions/mutations/overrides";
import { categoryOptions, locations } from "@/lib/formOptions";

type formValues = z.infer<typeof formSchema>;

interface Props {
  id: number;
  facilityID: number;
}

export default function Options({ id, facilityID }: Props) {
  const form = useForm<formValues>({
    resolver: zodResolver(formSchema),
  });
  const costChangeID = costChange.bind(null, id);
  const facilityChangeID = facilityChange.bind(
    null,
    id,
    form.watch("facility"),
  );
  const categoryChangeID = categoryChange.bind(
    null,
    id,
    facilityID,
    form.watch("category"),
  );

  return (
    <Tabs defaultValue="Cost">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="Cost">Total Cost Override</TabsTrigger>
        <TabsTrigger value="Facility">Change Facility</TabsTrigger>
        <TabsTrigger value="Category">Change Category</TabsTrigger>
      </TabsList>
      <TabsContent value="Cost">
        <Card className="m-2 flex h-auto flex-col items-center justify-center align-middle">
          <form action={costChangeID}>
            <Label htmlFor="newCost">Manually Set Total</Label>
            <Input className="w-auto text-black" type="number" name="newCost" />
            <Button
              variant="outline"
              className="flex justify-end self-end"
              type="submit"
            >
              Submit
            </Button>
          </form>
        </Card>
      </TabsContent>
      <TabsContent value="Facility">
        <Card className="m-2 flex h-auto flex-col items-center justify-center align-middle">
          <Form {...form}>
            <form action={facilityChangeID}>
              <FormField
                control={form.control}
                name="facility"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="newFacility">Change Facility</Label>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Facility" />
                      </SelectTrigger>
                      <SelectContent className="max-h-80 overflow-scroll">
                        {locations.map((location) => (
                          <SelectItem
                            key={location.value}
                            value={location.value.toString()}
                          >
                            {location.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <Button
                variant="outline"
                className="flex justify-end self-end"
                type="submit"
              >
                Submit
              </Button>
            </form>
          </Form>
        </Card>
      </TabsContent>
      <TabsContent value="Category">
        <Card className="m-2 flex h-auto flex-col items-center justify-center align-middle">
          <Form {...form}>
            <form action={categoryChangeID}>
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="newCategory">Change Category</Label>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent className="max-h-80 overflow-scroll">
                        {categoryOptions.map((category) => (
                          <SelectItem
                            key={category.value}
                            value={category.value.toString()}
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <Button
                variant="outline"
                className="flex justify-end self-end"
                type="submit"
              >
                Submit
              </Button>
            </form>
          </Form>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
