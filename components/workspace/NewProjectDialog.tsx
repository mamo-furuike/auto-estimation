"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type NewProjectFormValues } from "@/lib/estimate-vehicle-factory";

const EMPTY_FORM: NewProjectFormValues = {
  primeContractorName: "",
  customerName: "",
  vehicleName: "",
  plateInput: "",
  entryDate: "",
};

type NewProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: NewProjectFormValues) => void;
};

export function NewProjectDialog({
  open,
  onOpenChange,
  onSubmit,
}: NewProjectDialogProps) {
  const [form, setForm] = useState<NewProjectFormValues>(EMPTY_FORM);

  const resetForm = () => setForm(EMPTY_FORM);

  const updateField = <K extends keyof NewProjectFormValues>(
    key: K,
    value: NewProjectFormValues[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canSubmit =
    form.primeContractorName.trim() !== "" &&
    form.customerName.trim() !== "" &&
    form.vehicleName.trim() !== "" &&
    form.plateInput.trim() !== "" &&
    form.entryDate !== "";

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(form);
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) resetForm();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>新規プロジェクト</DialogTitle>
          <DialogDescription>
            元請先・お客様・車両情報を入力すると、左の一覧に追加されます。
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="new-project-prime-contractor">
              元請先名
            </FieldLabel>
            <Input
              id="new-project-prime-contractor"
              autoFocus
              value={form.primeContractorName}
              onChange={(e) =>
                updateField("primeContractorName", e.target.value)
              }
              placeholder="例: トヨタ車体株式会社"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="new-project-customer">お客様名</FieldLabel>
            <Input
              id="new-project-customer"
              value={form.customerName}
              onChange={(e) => updateField("customerName", e.target.value)}
              placeholder="例: 山田 太郎"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="new-project-vehicle">車名（メーカー・車種）</FieldLabel>
            <Input
              id="new-project-vehicle"
              value={form.vehicleName}
              onChange={(e) => updateField("vehicleName", e.target.value)}
              placeholder="例: Toyota RAV4"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="new-project-plate">ナンバープレート</FieldLabel>
            <Input
              id="new-project-plate"
              value={form.plateInput}
              onChange={(e) => updateField("plateInput", e.target.value)}
              placeholder="例: 品川 300 あ 1234"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="new-project-entry-date">入庫日</FieldLabel>
            <Input
              id="new-project-entry-date"
              type="date"
              value={form.entryDate}
              onChange={(e) => updateField("entryDate", e.target.value)}
            />
          </Field>
        </FieldGroup>

        <DialogFooter>
          <DialogClose render={<Button variant="outline">キャンセル</Button>} />
          <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
            追加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
