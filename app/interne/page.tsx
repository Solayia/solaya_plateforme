"use client";

import { useState } from "react";
import { ArrowUpRight, FileText, Globe2, LayoutGrid, Search } from "lucide-react";
import { resources } from "@/lib/resources";
import styles from "./directory.module.css";

const descriptions: Record<string, string> = {
  "/": "Présenter Solaya Collection, ses services et son univers aux voyageurs et propriétaires.",
  "/collection": "Retrouver les logements de la collection. Les premiers biens restent à ajouter.",
  "/proprietaires/airbnb": "Convaincre les propriétaires déjà sur Airbnb ou Booking avec nos services et la réservation directe.",
  "/proprietaires/longue-duree": "Présenter la location courte durée et comparer son potentiel avec la location classique.",
  "/etude": "Recueillir les informations d’un propriétaire pour préparer l’étude de son logement.",
  "/pilotage": "Suivre les prospects, les échanges et les prochaines actions. Accès réservé à Kevin.",
  "/interne/funnel": "Retrouver les étapes de prospection, les messages et les supports commerciaux associés.",
  "/pilotage/ressources": "Consulter les 15 sections de l’ancien kit commercial. Archive réservée à Kevin.",
  "/bienvenue/demo-saint-cyprien": "Découvrir un exemple de livret d’accueil voyageur pour le logement Saint-Cyprien.",
  "/bienvenue/demo-capitole": "Découvrir un exemple de livret d’accueil voyageur pour le logement Capitole.",
  "/interne/logements": "Créer et modifier les livrets d’accueil de chaque logement. Gestion réservée à Kevin.",
  "/documents/presentation.pdf": "Présenter l’agence et son accompagnement. Modèle PDF à personnaliser.",
  "/documents/etude-airbnb.pdf": "Préparer l’étude d’un bien déjà en location courte durée. Modèle PDF à compléter.",
  "/documents/etude-longue-duree.pdf": "Comparer location classique et courte durée. Modèle PDF à compléter.",
  "/documents/proposition.pdf": "Formaliser une offre d’accompagnement pour un propriétaire. Modèle PDF à compléter.",
  "/documents/modeles.json": "Retrouver les contenus sources utilisés pour générer les modèles PDF.",
  "/interne/lancement": "Retrouver les décisions à prendre et les éléments à compléter avant le lancement.",
};
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function Page() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const filtered = resources.filter(r => (!type || r[2] === type) && normalize(`${r.join(" ")} ${descriptions[r[3]] ?? "Document commercial partagé sur Google Docs."}`).includes(normalize(query.trim())));
  return <main className={styles.directory}>
    <div className={styles.heading}>
      <div><p className={styles.eyebrow}>SOLAYA COLLECTION · INTERNE</p><h1>Tous vos liens,<br className={styles.mobileBreak}/> au même endroit.</h1></div>
      <span className={styles.total}>{resources.length} ressources</span>
    </div>
    <div className={styles.controls}>
      <label className={styles.search}><Search size={20} aria-hidden="true"/><span className={styles.srOnly}>Rechercher une ressource</span><input type="search" placeholder="Rechercher une page, un document…" value={query} onChange={e => setQuery(e.target.value)}/></label>
      <label className={styles.filter}><span className={styles.srOnly}>Filtrer par type</span><select value={type} onChange={e => setType(e.target.value)}><option value="">Tous les types</option>{Array.from(new Set(resources.map(r => r[2]))).map(t => <option key={t}>{t}</option>)}</select></label>
    </div>
    <p className={styles.resultCount} aria-live="polite">{query || type ? `${filtered.length} résultat${filtered.length > 1 ? "s" : ""}` : "Pages, outils et documents"}</p>
    <div className={styles.grid}>
      {filtered.map(([title, , kind, url]) => {
        const external = url.startsWith("https:");
        const Icon = ["PDF", "Document", "Source"].includes(kind) ? FileText : ["Outil", "Formulaire"].includes(kind) ? LayoutGrid : Globe2;
        return <a className={styles.card} href={url} key={url}>
          <div className={styles.cardTop}><span className={styles.icon}><Icon size={22} strokeWidth={1.5} aria-hidden="true"/></span><span className={styles.kind}>{kind}</span><ArrowUpRight className={styles.arrow} size={21} aria-hidden="true"/></div>
          <h2>{title === "LP Airbnb / Booking" ? "Propriétaires Airbnb / Booking" : title === "LP longue durée" ? "Propriétaires en longue durée" : title}</h2>
          <p className={styles.description}>{descriptions[url] ?? "Retrouver la version partagée du document commercial Solaya sur Google Docs."}</p>
          <div className={styles.date}>{external ? <span>Mise à jour : voir le document</span> : <span>Mis à jour le <time dateTime="2026-09-14">14 sept. 2026</time></span>}</div>
        </a>;
      })}
    </div>
    {filtered.length === 0 && <div className={styles.empty}><h2>Aucune ressource trouvée</h2><p>Essayez un autre mot ou affichez tous les types.</p><button onClick={() => {setQuery(""); setType("");}}>Afficher toutes les ressources</button></div>}
  </main>;
}
