"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { getRepos } from "@/lib/data";
import { useLiveQuery } from "@/lib/data/hooks";
import type { Member } from "@/lib/data/types";
import { memberSchema, type MemberFormValues } from "@/lib/schemas";
import { matchesSearch } from "@/lib/search";

const TYPE_LABEL = { life: "Life", general: "General", founder: "Founder", honorary: "Honorary" } as const;

export function MembersAdmin() {
  const members = useLiveQuery<Member[] | null>((r) => r.members.list(), [], ["members"], null);
  const [editing, setEditing] = useState<Member | "new" | null>(null);
  const [search, setSearch] = useState("");
  if (!members) return <p className="text-ink-soft">Loading…</p>;
  const shown = members.filter((m) => matchesSearch(search, [m.name, m.nameHi, m.village, m.gotra])).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[2rem]">Members</h1>
        <button type="button" className="btn btn-primary" onClick={() => setEditing("new")}>Add member</button>
      </div>
      <div className="max-w-md">
        <label htmlFor="ms" className="field-label">Search</label>
        <input id="ms" type="search" className="field" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[48rem] text-left text-[0.95rem]">
          <thead className="border-b border-line bg-sand/60">
            <tr>{["Name", "Father", "Gotra", "Village", "Type", "Phone", "Listed", ""].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {shown.map((m) => (
              <tr key={m.id} className="border-b border-line/60">
                <td className="px-3 py-2"><span className="font-semibold">{m.name}</span>{m.nameHi && <span className="block text-ink-soft" lang="hi">{m.nameHi}</span>}</td>
                <td className="px-3 py-2">{m.fatherName}</td>
                <td className="px-3 py-2">{m.gotra}</td>
                <td className="px-3 py-2">{m.village}</td>
                <td className="px-3 py-2">{TYPE_LABEL[m.memberType]}</td>
                <td className="px-3 py-2">{m.phone ?? "—"} <span className="block text-[0.85rem] text-ink-soft">{m.phonePublic ? "public" : "private"}</span></td>
                <td className="px-3 py-2">{m.consentDisplay ? "Yes" : "No"}</td>
                <td className="px-3 py-2"><button type="button" className="btn btn-quiet min-h-9 px-3" onClick={() => setEditing(m)}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={editing !== null} title={editing === "new" ? "Add member" : "Edit member"} onClose={() => setEditing(null)} wide>
        {editing !== null && <MemberForm member={editing === "new" ? null : editing} onDone={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}

function MemberForm({ member, onDone }: { member: Member | null; onDone: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: member
      ? { ...member, nameHi: member.nameHi ?? "", phone: member.phone ?? "" }
      : { name: "", nameHi: "", fatherName: "", gotra: "", village: "", memberType: "general", phone: "", phonePublic: false, consentDisplay: true },
  });
  const onSubmit = async (v: MemberFormValues) => {
    const input = { ...v, nameHi: v.nameHi || undefined, phone: v.phone || undefined, photo: member?.photo };
    const repos = getRepos();
    if (member) await repos.members.update(member.id, input);
    else await repos.members.create(input);
    onDone();
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
      <Field label="Name (English)" required error={errors.name?.message}>{(p) => <input {...p} {...register("name")} className="field" />}</Field>
      <Field label="Name (Hindi)" error={errors.nameHi?.message}>{(p) => <input {...p} {...register("nameHi")} lang="hi" className="field" />}</Field>
      <Field label="Father's name" required error={errors.fatherName?.message}>{(p) => <input {...p} {...register("fatherName")} className="field" />}</Field>
      <Field label="Gotra" required error={errors.gotra?.message}>{(p) => <input {...p} {...register("gotra")} className="field" />}</Field>
      <Field label="Village" required error={errors.village?.message}>{(p) => <input {...p} {...register("village")} className="field" />}</Field>
      <Field label="Member type" required>
        {(p) => <select {...p} {...register("memberType")} className="field">{Object.entries(TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>}
      </Field>
      <Field label="Phone" error={errors.phone?.message}>{(p) => <input {...p} {...register("phone")} type="tel" className="field" />}</Field>
      <div className="space-y-2 pt-7">
        <label className="flex items-center gap-2"><input type="checkbox" {...register("phonePublic")} className="size-5 accent-maroon" /> Show phone publicly (member consented)</label>
        <label className="flex items-center gap-2"><input type="checkbox" {...register("consentDisplay")} className="size-5 accent-maroon" /> List on public members page</label>
      </div>
      <p className="text-[0.9rem] text-ink-soft sm:col-span-2">Photo upload is not part of the demo; an initials avatar is shown.</p>
      <button type="submit" className="btn btn-primary sm:col-span-2" disabled={isSubmitting}>Save member</button>
    </form>
  );
}
