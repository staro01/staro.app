import {
  PhoneIcon,
  ClockIcon,
  BoltIcon,
  CheckBadgeIcon,
  TargetIcon,
  CoinIcon,
  MessageIcon,
  CalendarIcon,
} from "./icons";

export type VerticalContent = {
  slug: string;
  metier: string;
  metierPluriel: string;
  title: string;
  metaDescription: string;
  heroTitle: string;
  heroDescription: string;
  urgency: boolean;
  painPoints: { title: string; description: string }[];
  features: { Icon: typeof PhoneIcon; title: string; description: string }[];
  faq: { q: string; a: string }[];
};

export const VERTICALS: Record<string, VerticalContent> = {
  electricien: {
    slug: "electricien",
    metier: "électricien",
    metierPluriel: "électriciens",
    title: "Agent vocal IA pour électriciens — Staro.app",
    metaDescription:
      "Standard téléphonique intelligent pour électriciens en Vaucluse et dans le Gard. Staro répond à chaque appel, qualifie la demande et transfère immédiatement en cas d'urgence.",
    heroTitle: "L'agent vocal IA pour les électriciens",
    heroDescription:
      "Sur une intervention, en hauteur, ou entre deux chantiers : impossible de décrocher à chaque fois. Staro répond à votre place, qualifie la demande et vous transfère immédiatement s'il s'agit d'une urgence électrique.",
    urgency: true,
    painPoints: [
      {
        title: "Un appel raté, c'est un devis qui part ailleurs",
        description:
          "En Vaucluse et dans le Gard, la concurrence est forte. Un client qui tombe sur une messagerie appelle l'électricien suivant sur Google en moins d'une minute.",
      },
      {
        title: "Les urgences ne préviennent pas",
        description:
          "Un tableau qui disjoncte, une odeur de brûlé : ces appels ne peuvent pas attendre le soir. Il faut pouvoir les identifier et réagir tout de suite.",
      },
      {
        title: "Impossible de répondre en intervention",
        description:
          "Sur un chantier, les mains dans le tableau électrique, décrocher n'est ni pratique ni sûr.",
      },
    ],
    features: [
      {
        Icon: BoltIcon,
        title: "Détection d'urgence intégrée",
        description:
          "Panne totale, disjoncteur qui saute en boucle, odeur de brûlé : Staro identifie la situation et vous transfère l'appel immédiatement.",
      },
      {
        Icon: MessageIcon,
        title: "Qualification complète de la demande",
        description:
          "Type d'intervention, adresse, disponibilité du client : toutes les infos utiles sont prises avant même que vous rappeliez.",
      },
      {
        Icon: TargetIcon,
        title: "Pensé pour le métier",
        description:
          "Staro comprend le vocabulaire du métier — tableau électrique, mise aux normes, disjoncteur — et pose les bonnes questions.",
      },
      {
        Icon: ClockIcon,
        title: "Disponible 24/7",
        description:
          "Le soir, le week-end, pendant un chantier : Staro répond toujours, même quand vous ne pouvez pas.",
      },
    ],
    faq: [
      {
        q: "Staro peut-il identifier une urgence électrique et me transférer directement ?",
        a: "Oui. L'agent est configuré pour détecter les situations urgentes (panne totale, risque de sécurité) et vous transfère l'appel immédiatement au lieu de simplement prendre un message.",
      },
      {
        q: "Est-ce que Staro peut donner des devis à ma place ?",
        a: "Non, Staro qualifie la demande et prend toutes les informations utiles (type d'intervention, adresse, urgence ou non), mais c'est vous qui donnez le devis final par téléphone ou sur place.",
      },
      {
        q: "Combien de temps pour mettre en place l'agent vocal ?",
        a: "La configuration prend environ 15 minutes. Votre numéro est opérationnel le jour même.",
      },
      {
        q: "Est-ce que je peux tester avant de payer ?",
        a: "Oui, 7 jours d'essai gratuit, sans carte bancaire débitée avant la fin de l'essai, et sans engagement ensuite.",
      },
    ],
  },

  plombier: {
    slug: "plombier",
    metier: "plombier",
    metierPluriel: "plombiers",
    title: "Agent vocal IA pour plombiers — Staro.app",
    metaDescription:
      "Standard téléphonique intelligent pour plombiers en Vaucluse et dans le Gard. Staro répond à chaque appel, qualifie la demande et transfère immédiatement en cas de fuite ou d'urgence.",
    heroTitle: "L'agent vocal IA pour les plombiers",
    heroDescription:
      "Une fuite n'attend pas. Staro répond à chaque appel, qualifie la demande et vous transfère immédiatement s'il s'agit d'une urgence — pendant que vous êtes sur un chantier ou en dehors de vos horaires.",
    urgency: true,
    painPoints: [
      {
        title: "Les urgences (fuite, dégât des eaux) ne peuvent pas attendre",
        description:
          "Un client avec de l'eau qui coule ne peut pas laisser un message et attendre le rappel du soir — il appelle le plombier suivant.",
      },
      {
        title: "Impossible de décrocher sous un évier ou dans les combles",
        description: "Sur une intervention, répondre au téléphone n'est ni pratique ni toujours possible.",
      },
      {
        title: "Le bouche-à-oreille se joue aussi sur la réactivité",
        description:
          "Un client satisfait par la rapidité de prise en charge devient un client fidèle — et en parle autour de lui.",
      },
    ],
    features: [
      {
        Icon: BoltIcon,
        title: "Détection d'urgence intégrée",
        description:
          "Fuite active, dégât des eaux, canalisation bouchée en urgence : Staro identifie la situation et vous transfère l'appel immédiatement.",
      },
      {
        Icon: MessageIcon,
        title: "Qualification complète de la demande",
        description: "Type d'intervention, adresse, urgence ou non : toutes les infos utiles sont prises dès l'appel.",
      },
      {
        Icon: TargetIcon,
        title: "Pensé pour le métier",
        description: "Staro comprend le vocabulaire du métier — chauffe-eau, robinetterie, canalisation — et pose les bonnes questions.",
      },
      {
        Icon: ClockIcon,
        title: "Disponible 24/7",
        description: "Le soir, le week-end, en intervention : Staro répond toujours, même quand vous ne pouvez pas.",
      },
    ],
    faq: [
      {
        q: "Staro peut-il identifier une urgence (fuite, dégât des eaux) et me transférer directement ?",
        a: "Oui. L'agent détecte les situations urgentes et vous transfère l'appel immédiatement au lieu de simplement prendre un message.",
      },
      {
        q: "Est-ce que Staro peut donner des devis à ma place ?",
        a: "Non, Staro qualifie la demande et prend toutes les informations utiles, mais c'est vous qui donnez le devis final.",
      },
      {
        q: "Combien de temps pour mettre en place l'agent vocal ?",
        a: "La configuration prend environ 15 minutes. Votre numéro est opérationnel le jour même.",
      },
      {
        q: "Est-ce que je peux tester avant de payer ?",
        a: "Oui, 7 jours d'essai gratuit, sans carte bancaire débitée avant la fin de l'essai, et sans engagement ensuite.",
      },
    ],
  },

  chauffagiste: {
    slug: "chauffagiste",
    metier: "chauffagiste",
    metierPluriel: "chauffagistes",
    title: "Agent vocal IA pour chauffagistes — Staro.app",
    metaDescription:
      "Standard téléphonique intelligent pour chauffagistes en Vaucluse et dans le Gard. Staro répond à chaque appel, qualifie la demande et transfère immédiatement en cas de panne de chauffage.",
    heroTitle: "L'agent vocal IA pour les chauffagistes",
    heroDescription:
      "Une panne de chauffage en plein hiver ne peut pas attendre. Staro répond à chaque appel, qualifie la demande et vous transfère immédiatement en cas d'urgence — pendant que vous êtes en intervention.",
    urgency: true,
    painPoints: [
      {
        title: "Les pannes de chauffage sont urgentes, surtout en hiver",
        description: "Un client sans chauffage en plein hiver appelle le chauffagiste suivant s'il ne peut pas vous joindre.",
      },
      {
        title: "Forte activité saisonnière",
        description: "En période de pointe, le téléphone n'arrête pas de sonner — impossible de tout gérer en intervention.",
      },
      {
        title: "L'entretien annuel, une activité récurrente à ne pas perdre",
        description: "Un appel manqué pour une révision de chaudière, c'est un contrat d'entretien qui part chez le concurrent.",
      },
    ],
    features: [
      {
        Icon: BoltIcon,
        title: "Détection d'urgence intégrée",
        description: "Panne totale de chauffage, fuite de gaz suspectée : Staro identifie la situation et vous transfère l'appel immédiatement.",
      },
      {
        Icon: MessageIcon,
        title: "Qualification complète de la demande",
        description: "Type d'intervention (dépannage, entretien, installation), adresse, urgence ou non : tout est pris dès l'appel.",
      },
      {
        Icon: TargetIcon,
        title: "Pensé pour le métier",
        description: "Staro comprend le vocabulaire du métier — chaudière, pompe à chaleur, entretien annuel — et pose les bonnes questions.",
      },
      {
        Icon: ClockIcon,
        title: "Disponible 24/7",
        description: "Le soir, le week-end, en pleine saison de chauffe : Staro répond toujours, même quand vous ne pouvez pas.",
      },
    ],
    faq: [
      {
        q: "Staro peut-il identifier une panne de chauffage urgente et me transférer directement ?",
        a: "Oui. L'agent détecte les situations urgentes et vous transfère l'appel immédiatement au lieu de simplement prendre un message.",
      },
      {
        q: "Est-ce que Staro peut gérer les demandes d'entretien annuel ?",
        a: "Oui, Staro qualifie la demande (dépannage, entretien, installation) et prend toutes les informations utiles pour que vous puissiez planifier l'intervention.",
      },
      {
        q: "Combien de temps pour mettre en place l'agent vocal ?",
        a: "La configuration prend environ 15 minutes. Votre numéro est opérationnel le jour même.",
      },
      {
        q: "Est-ce que je peux tester avant de payer ?",
        a: "Oui, 7 jours d'essai gratuit, sans carte bancaire débitée avant la fin de l'essai, et sans engagement ensuite.",
      },
    ],
  },

  paysagiste: {
    slug: "paysagiste",
    metier: "paysagiste",
    metierPluriel: "paysagistes",
    title: "Agent vocal IA pour paysagistes — Staro.app",
    metaDescription:
      "Standard téléphonique intelligent pour paysagistes en Vaucluse et dans le Gard. Staro répond à chaque appel de devis, même en pleine saison, pendant que vous êtes sur un chantier.",
    heroTitle: "L'agent vocal IA pour les paysagistes",
    heroDescription:
      "En pleine saison, le téléphone sonne pendant que vous tondez, taillez ou êtes sur un chantier. Staro répond à votre place, qualifie chaque demande de devis ou d'entretien, et vous transmet l'information complète.",
    urgency: false,
    painPoints: [
      {
        title: "Impossible de décrocher en tondant ou en hauteur",
        description: "Sur un chantier d'entretien, répondre au téléphone n'est ni pratique ni sûr.",
      },
      {
        title: "Un devis manqué, c'est un contrat d'entretien perdu",
        description:
          "Un contrat d'entretien récurrent vaut largement plus qu'une intervention ponctuelle — et se joue souvent sur qui répond en premier.",
      },
      {
        title: "Volume d'appels élevé en haute saison",
        description: "De mars à septembre, le nombre d'appels de devis explose — difficile de tout suivre seul ou en petite équipe.",
      },
    ],
    features: [
      {
        Icon: MessageIcon,
        title: "Qualification complète du projet",
        description: "Type de prestation (entretien, création, taille), surface, adresse : Staro prend toutes les infos utiles pour préparer votre devis.",
      },
      {
        Icon: TargetIcon,
        title: "Pensé pour le métier",
        description: "Staro comprend le vocabulaire du métier — entretien de jardin, taille de haie, création paysagère — et pose les bonnes questions.",
      },
      {
        Icon: CoinIcon,
        title: "Ne perdez plus de contrats récurrents",
        description: "Chaque demande d'entretien régulier est qualifiée et transmise, pour ne plus laisser filer de clientèle fidèle.",
      },
      {
        Icon: ClockIcon,
        title: "Disponible 24/7, même en haute saison",
        description: "Le soir, le week-end, en pleine saison de tonte : Staro répond toujours, même quand vous ne pouvez pas.",
      },
    ],
    faq: [
      {
        q: "Staro peut-il gérer un fort volume d'appels en haute saison ?",
        a: "Oui, l'agent répond à tous les appels simultanément, sans limite, y compris pendant les pics d'activité du printemps et de l'été.",
      },
      {
        q: "Est-ce que Staro peut donner un devis à ma place ?",
        a: "Non, Staro qualifie la demande (type de prestation, surface, adresse) et prend toutes les informations utiles, mais c'est vous qui établissez le devis.",
      },
      {
        q: "Combien de temps pour mettre en place l'agent vocal ?",
        a: "La configuration prend environ 15 minutes. Votre numéro est opérationnel le jour même.",
      },
      {
        q: "Est-ce que je peux tester avant de payer ?",
        a: "Oui, 7 jours d'essai gratuit, sans carte bancaire débitée avant la fin de l'essai, et sans engagement ensuite.",
      },
    ],
  },

  coiffeur: {
    slug: "coiffeur",
    metier: "coiffeur",
    metierPluriel: "coiffeurs et instituts",
    title: "Agent vocal IA pour salons de coiffure — Staro.app",
    metaDescription:
      "Standard téléphonique intelligent pour salons de coiffure en Vaucluse et dans le Gard. Staro répond au téléphone et prend les rendez-vous, même pendant un brushing.",
    heroTitle: "L'agent vocal IA pour les salons de coiffure",
    heroDescription:
      "Pendant une coupe ou une couleur, impossible de décrocher. Staro répond à votre place, prend le rendez-vous ou qualifie la demande, et vous transmet toutes les informations utiles.",
    urgency: false,
    painPoints: [
      {
        title: "Impossible de répondre en plein soin",
        description: "Les mains dans les cheveux d'une cliente, décrocher n'est pas toujours possible — et le téléphone continue de sonner.",
      },
      {
        title: "Un appel manqué, c'est un rendez-vous chez le salon d'à côté",
        description: "Une cliente qui tombe sur une messagerie prend rendez-vous ailleurs, souvent sans même laisser de message.",
      },
      {
        title: "Gérer le planning en même temps que le salon",
        description: "Entre les soins et les appels, suivre les disponibilités devient vite compliqué en heures de rush.",
      },
    ],
    features: [
      {
        Icon: CalendarIcon,
        title: "Prise de rendez-vous automatique",
        description: "Staro consulte les disponibilités et prend le rendez-vous directement au téléphone, sans intervention de votre part.",
      },
      {
        Icon: MessageIcon,
        title: "Qualification complète de la demande",
        description: "Prestation souhaitée, coiffeur préféré, créneau : toutes les infos utiles sont prises dès l'appel.",
      },
      {
        Icon: CheckBadgeIcon,
        title: "SMS de confirmation automatique",
        description: "La cliente reçoit une confirmation par SMS, sans aucune action de votre part.",
      },
      {
        Icon: ClockIcon,
        title: "Disponible 24/7",
        description: "Même fermé, même en plein rush : Staro répond toujours et prend les rendez-vous.",
      },
    ],
    faq: [
      {
        q: "Staro peut-il vraiment prendre un rendez-vous directement au téléphone ?",
        a: "Oui, si votre salon n'utilise pas déjà un outil de réservation en ligne comme Planity ou Fresha. Staro consulte les disponibilités de votre équipe et confirme le créneau directement pendant l'appel.",
      },
      {
        q: "Et si j'utilise déjà Planity ou un autre outil de réservation ?",
        a: "Staro qualifie la demande (prestation, créneau souhaité) et vous transmet l'information pour que vous confirmiez vous-même dans votre outil habituel.",
      },
      {
        q: "Est-ce que mes clientes sont informées automatiquement ?",
        a: "Oui, un SMS de confirmation est envoyé automatiquement dès que le rendez-vous est pris.",
      },
      {
        q: "Est-ce que je peux tester avant de payer ?",
        a: "Oui, 7 jours d'essai gratuit, sans carte bancaire débitée avant la fin de l'essai, et sans engagement ensuite.",
      },
    ],
  },
};

export type VerticalSlug = keyof typeof VERTICALS;
