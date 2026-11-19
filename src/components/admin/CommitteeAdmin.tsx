"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { getRepos } from "@/lib/data";
import { useLiveQuery } from "@/lib/data/hooks";
import type { CommitteePost } from "@/lib/data/types";
import { committeeSchema, type CommitteeFormValues } from "@/lib/schemas";

export function CommitteeAdmin() {
  const list = useLiveQuery<CommitteePost[] | null>((r) => r.committee.list(), [], ["committee"], null);
  const [editing, setEditing] = useState<CommitteePost | "new" | null>(null);
  if (!list) return <p className="text-ink-soft">Loading…</p>;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[2rem]">Committee</h1>
        <button type="button" className="btn btn-primary" onClick={() => setEditing("new")}>Add post</button>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[48rem] text-left text-[0.95rem]">
          <thead className="border-b border-line bg-sand/60">
            <tr>{["Rank", "Post", "Name", "Father", "Term", "Phone", ""].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-b border-line/60">
                <td className="px-3 py-2 tabular-nums">{c.postRank}</td>
                <td className="px-3 py-2">{c.postEn}<span className="block text-ink-soft" lang="hi">{c.postHi}</span></td>
                <td className="px-3 py-2"><span className="font-semibold">{c.name}</span>{c.nameHi && <span className="block text-ink-soft" lang="hi">{c.nameHi}</span>}</td>
                <td className="px-3 py-2">{c.fatherName}</td>
                <td className="px-3 py-2">{c.termLabel}</td>
                <td className="px-3 py-2">{c.phone ?? "—"}<span className="block text-[0.85rem] text-ink-soft">{c.phonePublic ? "public" : "private"}</span></td>
                <td className="px-3 py-2"><button type="button" className="btn btn-quiet min-h-9 px-3" onClick={() => setEditing(c)}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={editing !== null} title={editing === "new" ? "Add committee post" : "Edit committee post"} onClose={() => setEditing(null)} wide>
        {editing !== null && <CommitteeForm post={editing === "new" ? null : editing} nextRank={list.length + 1} onDone={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}

function CommitteeForm({ post, nextRank, onDone }: { post: CommitteePost | null; nextRank: number; onDone: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CommitteeFormValues>({
    resolver: zodResolver(committeeSchema),
    defaultValues: post
      ? { ...post, nameHi: post.nameHi ?? "", phone: post.phone ?? "" }
      : { postHi: "", postEn: "", postRank: nextRank, name: "", nameHi: "", fatherName: "", termLabel: "2025–2028", phone: "", phonePublic: false },
  });
  const onSubmit = async (v: CommitteeFormValues) => {
    const input = { ...v, nameHi: v.nameHi || undefined, phone: v.phone || undefined, photo: post?.photo };
    const repos = getRepos();
    if (post) await repos.committee.update(post.id, input);
    else await repos.committee.create(input);
    onDone();
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
      <Field label="Post (Hindi)" required error={errors.postHi?.message}>{(p) => <input {...p} {...register("postHi")} lang="hi" className="field" />}</Field>
      <Field label="Post (English)" required error={errors.postEn?.message}>{(p) => <input {...p} {...register("postEn")} className="field" />}</Field>
      <Field label="Rank (1 = first)" required error={errors.postRank?.message}>{(p) => <input {...p} {...register("postRank", { valueAsNumber: true })} type="number" min={1} className="field" />}</Field>
      <Field label="Term" required error={errors.termLabel?.message}>{(p) => <input {...p} {...register("termLabel")} className="field" />}</Field>
      <Field label="Name (English)" required error={errors.name?.message}>{(p) => <input {...p} {...register("name")} className="field" />}</Field>
      <Field label="Name (Hindi)" error={errors.nameHi?.message}>{(p) => <input {...p} {...register("nameHi")} lang="hi" className="field" />}</Field>
      <Field label="Father's name" required error={errors.fatherName?.message}>{(p) => <input {...p} {...register("fatherName")} className="field" />}</Field>
      <Field label="Phone" error={errors.phone?.message}>{(p) => <input {...p} {...register("phone")} type="tel" className="field" />}</Field>
      <label className="flex items-center gap-2 sm:col-span-2"><input type="checkbox" {...register("phonePublic")} className="size-5 accent-maroon" /> Show phone publicly (consent given)</label>
      <button type="submit" className="btn btn-primary sm:col-span-2" disabled={isSubmitting}>Save</button>
    </form>
  );
}
