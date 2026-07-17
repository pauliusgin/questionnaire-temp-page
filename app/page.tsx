"use client";

import { SyntheticEvent, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  MultiChoice,
  NumberField,
  Question,
  TextAreaField,
  TextField,
} from "./fields";

const ATTENDANCE_METHODS = [
  "Popieriuje / sąsiuvinyje",
  "Excel / Google Sheets",
  "Susirašinėjimo programėlėje",
  "Klubo tinklalapyje / programėlėje",
  "Treneriai laiko galvoje",
  "Kita",
] as const;

const FEE_MODELS = [
  "Fiksuotas mėnesinis mokestis",
  "Už kiekvieną aplankytą treniruotę",
  "Pagal grupę ar lygį",
  "Kelių būdų derinys",
  "Kita",
] as const;

const INVOICING_METHODS = [
  "Rankiniu būdu kiekvienam nariui",
  "Buhalterinė programa",
  "Klubo programėlė",
  "Sąskaitos neišrašinėjamos",
  "Kita",
] as const;

const PAYMENT_METHODS = [
  "Bankinis pavedimas",
  "Grynaisiais pinigais",
  "Klubo programėlė",
  "Kita",
] as const;

const ADMIN_OWNERS = [
  "Klubo savininkas / vadovas",
  "Treneriai",
  "Atskiras administratorius",
  "Buhalteris",
  "Savanoris ar tėvai",
  "Kita",
] as const;

const ERROR_AREAS = [
  "Lankomumo žymėjimas",
  "Mokesčio skaičiavimas",
  "Sąskaitų išrašymas",
  "Mokėjimų susiejimas su nariais",
  "Vėluojančių mokėjimų priminimas",
  "Narių duomenų atnaujinimas",
  "Kita",
] as const;

type FormState = {
  activeMembers: string;
  coaches: string;
  trainingGroups: string;
  clubDescription: string;
  attendanceMethods: string[];
  attendanceDetails: string;
  feeModel: string[];
  invoicingMethods: string[];
  paymentMethods: string[];
  feeDetails: string;
  toolsUsed: string;
  adminHoursPerMonth: string;
  adminOwner: string[];
  worksWell: string;
  mostInconvenient: string;
  errorAreas: string[];
  errorDetails: string;
  automateOne: string;
  anythingElse: string;
  contactEmail: string;
  referrals: string;
};

const INITIAL_STATE: FormState = {
  activeMembers: "",
  coaches: "",
  trainingGroups: "",
  clubDescription: "",
  attendanceMethods: [],
  attendanceDetails: "",
  feeModel: [],
  invoicingMethods: [],
  paymentMethods: [],
  feeDetails: "",
  toolsUsed: "",
  adminHoursPerMonth: "",
  adminOwner: [],
  worksWell: "",
  mostInconvenient: "",
  errorAreas: [],
  errorDetails: "",
  automateOne: "",
  anythingElse: "",
  contactEmail: "",
  referrals: "",
};

type Status = "idle" | "sending" | "sent" | "error";

const toNumberOrNull = (value: string) => {
  if (value?.trim() === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

// Trim text answers and store null instead of an empty string.
const toTextOrNull = (value: string) => {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

export default function Home() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [status, setStatus] = useState<Status>("idle");
  const [emptyWarning, setEmptyWarning] = useState(false);

  const update = <Key extends keyof FormState>(
    key: Key,
    value: FormState[Key],
  ) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const handleSubmit = async (
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    event.preventDefault();
    if (status === "sending") {
      return;
    }
    // Every question is optional, but an entirely blank form should not create
    // a document. Contact-only submissions (email / referral) are allowed.
    const answers = {
      activeMembers: toNumberOrNull(form.activeMembers),
      coaches: toNumberOrNull(form.coaches),
      trainingGroups: toNumberOrNull(form.trainingGroups),
      clubDescription: toTextOrNull(form.clubDescription),
      attendanceMethods: form.attendanceMethods,
      attendanceDetails: toTextOrNull(form.attendanceDetails),
      feeModel: form.feeModel,
      invoicingMethods: form.invoicingMethods,
      paymentMethods: form.paymentMethods,
      feeDetails: toTextOrNull(form.feeDetails),
      toolsUsed: toTextOrNull(form.toolsUsed),
      adminHoursPerMonth: toNumberOrNull(form.adminHoursPerMonth),
      adminOwner: form.adminOwner,
      worksWell: toTextOrNull(form.worksWell),
      mostInconvenient: toTextOrNull(form.mostInconvenient),
      errorAreas: form.errorAreas,
      errorDetails: toTextOrNull(form.errorDetails),
      automateOne: toTextOrNull(form.automateOne),
      anythingElse: toTextOrNull(form.anythingElse),
    };

    const hasAnswer = Object.values(answers).some((value) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== null;
    });

    const email = toTextOrNull(form.contactEmail);
    const referralText = toTextOrNull(form.referrals);

    if (!hasAnswer && email === null && referralText === null) {
      setEmptyWarning(true);
      return;
    }
    setEmptyWarning(false);

    setStatus("sending");
    try {
      // Contact details are kept out of the answers document and written to a
      // separate collection so responses cannot be tied back to a person.
      if (hasAnswer) {
        await addDoc(collection(db, "responses"), {
          ...answers,
          submittedAt: serverTimestamp(),
        });
      }

      if (email !== null) {
        await addDoc(collection(db, "contacts"), {
          email,
          submittedAt: serverTimestamp(),
        });
      }

      if (referralText !== null) {
        await addDoc(collection(db, "referrals"), {
          referral: referralText,
          submittedAt: serverTimestamp(),
        });
      }

      setStatus("sent");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 items-center px-6 py-24">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Ačiū</p>
          <h1 className="font-serif text-4xl leading-tight">
            Jūsų atsakymai gauti.
          </h1>
          <p className="text-[15px] leading-relaxed text-muted">
            Ačiū už jūsų laiką! Jūsų atsakymai tikrai naudingi - jie padės
            geriau suprasti sporto klubų administravimo procesus ir nulems, kas
            bus kuriama toliau.
            <br></br>
            Jei palikote savo el. pašto adresą, galiu su jumis susisiekti dėl
            vieno ar kelių papildomų klausimų. Jei iš šios idėjos gims
            produktas, taip pat pakviesiu jus vienus iš pirmųjų jį išbandyti.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16 sm:py-24">
      <header className="space-y-8 pb-12">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            Anketa
          </p>
          <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
            Klubo administravimas
          </h1>
        </div>

        <div className="space-y-4 text-[15px] text-justify leading-relaxed text-foreground/90 ">
          <p>Sveiki!</p>
          <p>
            Mano vardas Paulius Giniūnas. Esu programuotojas ir neseniai padėjau
            vienam sporto klubui automatizuoti dalį administracinių procesų.
          </p>
          <p>
            Tai paskatino susimąstyti – gal ir kiti sporto klubai susiduria su
            panašiais iššūkiais? Norėčiau geriau suprasti, kaip klubai šiandien
            tvarko administracinius procesus ir ar yra galimybių juos
            supaprastinti.
          </p>
          <p>
            Todėl atlieku trumpą apklausą apie tai, kaip sporto klubai
            registruoja lankomumą, skaičiuoja nario mokesčius ir išrašo
            sąskaitas faktūras. Mane ypač domina, kokie procesai užima
            daugiausia laiko, kas veikia gerai ir kur kyla daugiausia sunkumų.
          </p>
          <p>
            Anketos pildymas užtruks apie 10 minučių. Iš anksto dėkoju už skirtą
            laiką ir pasidalintą patirtį!
          </p>
        </div>

        <div className="space-y-3 rounded-sm border border-line bg-surface/60 p-5 text-[13px] text-justify leading-relaxed text-muted">
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
            Privatumas
          </p>
          <p>
            Jūsų atsakymai bus naudojami tik apibendrintai analizei, siekiant
            geriau suprasti, kaip sporto klubai organizuoja administracinius
            procesus ir su kokiais iššūkiais susiduria.
          </p>
          <p>
            Anketoje nėra prašoma nurodyti jus ar jūsų klubą identifikuojančios
            informacijos, todėl atsakymai nebus siejami su konkrečiais asmenimis
            ar klubais ir nebus naudojami kaip atskiri atvejų pavyzdžiai.
          </p>
          <p>
            Jei anketos pabaigoje nuspręsite palikti savo el. pašto adresą, jis
            bus saugomas atskirai nuo anketos atsakymų ir naudojamas tik tam,
            kad prireikus galėčiau su jumis susisiekti dėl papildomų klausimų ar
            būsimo sprendimo testavimo.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-10">
        <Question
          index={1}
          title="Trumpai apibūdinkite savo klubą"
          hint="Kiek turite aktyvių narių, trenerių ir treniruočių grupių?">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <NumberField
              label="Aktyvūs nariai"
              value={form.activeMembers}
              onChange={(value) => update("activeMembers", value)}
              placeholder="0"
            />
            <NumberField
              label="Treneriai"
              value={form.coaches}
              onChange={(value) => update("coaches", value)}
              placeholder="0"
            />
            <NumberField
              label="Treniruočių grupės"
              value={form.trainingGroups}
              onChange={(value) => update("trainingGroups", value)}
              placeholder="0"
            />
          </div>
          <TextAreaField
            label="Savais žodžiais"
            value={form.clubDescription}
            onChange={(value) => update("clubDescription", value)}
            placeholder="Sporto šaka, amžiaus grupė, kiek laiko klubas veikia, ką dar svarbu žinoti."
          />
        </Question>

        <Question
          index={2}
          title="Kaip šiuo metu registruojate ir sekate narių lankomumą?">
          <MultiChoice
            label="Būdai"
            options={ATTENDANCE_METHODS}
            values={form.attendanceMethods}
            onChange={(values) => update("attendanceMethods", values)}
          />
          <TextAreaField
            label="Kaip tai vyksta praktiškai"
            value={form.attendanceDetails}
            onChange={(value) => update("attendanceDetails", value)}
            placeholder="Kas žymi lankomumą, kada, ir kas su tais duomenimis vyksta vėliau?"
          />
        </Question>

        <Question
          index={3}
          title="Kaip apskaičiuojate, kiek kiekvienas narys turi mokėti ir kaip išrašote sąskaitas?">
          <MultiChoice
            label="Mokesčio modelis"
            options={FEE_MODELS}
            values={form.feeModel}
            onChange={(value) => update("feeModel", value)}
          />
          <MultiChoice
            label="Sąskaitų išrašymas"
            options={INVOICING_METHODS}
            values={form.invoicingMethods}
            onChange={(values) => update("invoicingMethods", values)}
          />
          <MultiChoice
            label="Apmokėjimo būdai"
            options={PAYMENT_METHODS}
            values={form.paymentMethods}
            onChange={(values) => update("paymentMethods", values)}
          />
          <TextAreaField
            label="Papasakokite plačiau"
            value={form.feeDetails}
            onChange={(value) => update("feeDetails", value)}
            placeholder="Nuolaidos, sustabdytos narystės, praleistos treniruotės - įdomiausia būtent išimtys ir sunkumai"
          />
        </Question>

        <Question
          index={4}
          title="Kiek maždaug laiko per mėnesį skiriate administravimui?"
          hint="Lankomumas, sąskaitos, mokėjimų tikrinimas.">
          <div className="grid gap-4 sm:max-w-[16rem]">
            <NumberField
              label="Valandų per mėnesį"
              value={form.adminHoursPerMonth}
              onChange={(value) => update("adminHoursPerMonth", value)}
              placeholder="0"
            />
          </div>
          <MultiChoice
            label="Kas tai atlieka"
            options={ADMIN_OWNERS}
            values={form.adminOwner}
            onChange={(value) => update("adminOwner", value)}
          />
        </Question>

        <Question
          index={5}
          title="Ar naudojate kokią nors programinę įrangą klubui administruoti?"
          hint="Lankomumas, sąskaitos, mokėjimai. Ir kodėl pasirinkote būtent jas?">
          <TextAreaField
            value={form.toolsUsed}
            onChange={(value) => update("toolsUsed", value)}
            placeholder="Priemonių pavadinimai ir kas nulėmė pasirinkimą - kaina, rekomendacija, ar tiesiog jau buvo naudojama?"
            rows={5}
          />
        </Question>

        <Question
          index={6}
          title="Kas jūsų dabartiniuose procesuose veikia gerai - kas jums patinka?">
          <TextAreaField
            value={form.worksWell}
            onChange={(value) => update("worksWell", value)}
            placeholder="Tai, ko nenorėtumėte prarasti."
          />
        </Question>

        <Question
          index={7}
          title="Kas šiame procese nepatogiausia ar atima daugiausiai laiko?">
          <TextAreaField
            value={form.mostInconvenient}
            onChange={(value) => update("mostInconvenient", value)}
            placeholder="Ta dalis, kurią vis atidėliojate..."
          />
        </Question>

        <Question
          index={8}
          title="Kur dažniausiai pasitaiko klaidų arba kur tenka kartoti tuos pačius rankinius veiksmus?">
          <MultiChoice
            label="Probleminės vietos"
            options={ERROR_AREAS}
            values={form.errorAreas}
            onChange={(values) => update("errorAreas", values)}
          />
          <TextAreaField
            label="Pavyzdys, jei toks ateina į galvą"
            value={form.errorDetails}
            onChange={(value) => update("errorDetails", value)}
            placeholder="Kas nutiko ne taip ir kaip tai pastebėjote?"
          />
        </Question>

        <Question
          index={9}
          title="Jei galėtumėte automatizuoti vieną administravimo dalį, kuri tai būtų?"
          hint="Ir kodėl būtent ji?">
          <TextAreaField
            value={form.automateOne}
            onChange={(value) => update("automateOne", value)}
            placeholder="Vienas dalykas. Tai, kuris sugrąžintų daugiausiai laiko ar ramybės."
          />
        </Question>

        <Question
          index={10}
          title="Ar yra dar kas nors svarbaus, ką vertėtų žinoti apie jūsų klubo administravimą?">
          <TextAreaField
            value={form.anythingElse}
            onChange={(value) => update("anythingElse", value)}
            placeholder="Viskas, ko nepaklausėme aukščiau."
          />
        </Question>

        <section className="border-t border-line pt-8">
          <div className="flex gap-4">
            <span className="mt-1 font-serif text-sm text-muted">•</span>
            <div className="flex-1 space-y-4">
              <div className="space-y-1.5">
                <h2 className="font-serif text-xl leading-snug">
                  Palikite būdą su jumis susisiekti
                </h2>
                <p className="text-sm text-muted">
                  Nebūtina. Jei projektas virs produktu, pirmiausia pakviesiu jį
                  išbandyti šios apklausos dalyvius. Taip pat galiu susisiekti
                  atsiradus papildomų klausimų
                </p>
              </div>
              <TextField
                label="El. paštas"
                type="email"
                value={form.contactEmail}
                onChange={(value) => update("contactEmail", value)}
              />
            </div>
          </div>
        </section>

        <section className="border-t border-line pt-8">
          <div className="flex gap-4">
            <span className="mt-1 font-serif text-sm text-muted">•</span>
            <div className="flex-1 space-y-4">
              <div className="space-y-1.5">
                <h2 className="font-serif text-xl leading-snug">
                  Ar žinote kitų klubų, kuriems tai galėtų būti aktualu?
                </h2>
                <p className="text-sm text-muted">
                  Nebūtina. Jei pažįstate kitų klubų, kurie susiduria su
                  panašiais administravimo iššūkiais ir kuriems galbūt praverstų
                  patogesni procesai, palikite jų pavadinimą ar bet kokią
                  kontaktinę informaciją - mielai su jais susisiekčiau.
                </p>
              </div>
              <TextAreaField
                value={form.referrals}
                onChange={(value) => update("referrals", value)}
                placeholder="Klubo pavadinimas, žmogaus vardas, el. paštas ar telefonas"
              />
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-4 border-t border-line pt-8">
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-sm bg-accent px-6 py-2.5 text-sm tracking-wide text-white transition-opacity hover:opacity-90 disabled:opacity-50">
            {status === "sending" ? "Siunčiama…" : "Pateikti atsakymus"}
          </button>
          {status === "error" ? (
            <p className="text-sm text-red-800">
              Siunčiant įvyko klaida. Bandykite dar kartą.
            </p>
          ) : null}
          {emptyWarning ? (
            <p className="text-sm text-red-800">
              Atsakykite į bent vieną klausimą
            </p>
          ) : null}
        </div>
      </form>
    </main>
  );
}
