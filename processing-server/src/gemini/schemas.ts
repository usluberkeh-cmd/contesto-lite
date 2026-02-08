import { z } from "zod/v3";

export const TrafficFineSchema = z.object({
  document_type: z
    .literal("avis_de_contravention")
    .describe("Type of document"),

  fine_identifiers: z.object({
    fine_number: z
      .string()
      .describe("Numéro de l’avis de contravention"),

    barcode_reference: z
      .string()
      .optional()
      .describe("Référence technique ou code barre"),

    qr_code_present: z
      .boolean()
      .describe("Indique si un QR code est présent sur le document")
  }).describe("Identifiants uniques de l’amende"),

  issuing_authority: z.object({
    country: z
      .literal("FRANCE")
      .describe("Pays émetteur"),

    authority_name: z
      .string()
      .describe("Autorité émettrice de l’avis"),

    website: z
      .string()
      .describe("Site officiel pour le paiement ou la contestation"),

    contact_phone: z
      .string()
      .optional()
      .describe("Numéro de contact de l’administration")
  }).describe("Autorité ayant émis l’avis"),

  notice_dates: z.object({
    notice_issue_date: z
      .string()
      .describe("Date d’émission de l’avis de contravention"),

    infraction_date: z
      .string()
      .describe("Date de constatation de l’infraction"),

    infraction_time: z
      .string()
      .describe("Heure de constatation de l’infraction")
  }).describe("Dates associées à l’avis et à l’infraction"),

  offender: z.object({
    full_name: z
      .string()
      .describe("Nom complet du titulaire du certificat d’immatriculation"),

    address: z.object({
      street: z
        .string()
        .describe("Adresse postale"),

      postal_code: z
        .string()
        .describe("Code postal"),

      city: z
        .string()
        .describe("Ville"),

      country: z
        .literal("FRANCE")
        .optional()
        .describe("Pays de résidence")
    }).describe("Adresse du contrevenant")
  }).describe("Informations sur le contrevenant"),

  vehicle: z.object({
    license_plate: z
      .string()
      .describe("Numéro d’immatriculation du véhicule"),

    country_of_registration: z
      .literal("FRANCE")
      .describe("Pays d’immatriculation"),

    brand: z
      .string()
      .describe("Marque du véhicule"),

    vehicle_owner_role: z
      .string()
      .optional()
      .describe("Rôle du contrevenant vis-à-vis du véhicule")
  }).describe("Informations sur le véhicule"),

  infraction: z.object({
    infraction_category: z
      .string()
      .describe("Catégorie générale de l’infraction"),

    infraction_description: z
      .string()
      .describe("Description détaillée de l’infraction"),

    legal_references: z
      .array(z.string())
      .describe("Articles de loi et références juridiques"),

    infraction_code: z
      .string()
      .optional()
      .describe("Code interne de l’infraction")
  }).describe("Détails juridiques de l’infraction"),

  location: z.object({
    street_name: z
      .string()
      .describe("Lieu précis de l’infraction"),

    city: z
      .string()
      .describe("Ville où l’infraction a été constatée"),

    department_code: z
      .string()
      .describe("Code du département"),

    country: z
      .literal("FRANCE")
      .describe("Pays de l’infraction")
  }).describe("Localisation de l’infraction"),

  enforcement: z.object({
    reporting_officer_id: z
      .string()
      .describe("Numéro de l’agent verbalisateur"),

    service_code: z
      .string()
      .describe("Code du service verbalisateur"),

    enforcement_agency: z
      .string()
      .optional()
      .describe("Organisme de contrôle")
  }).describe("Informations sur la verbalisation"),

  penalty: z.object({
    fine_type: z
      .literal("amende_forfaitaire")
      .describe("Type d’amende"),

    base_amount_eur: z
      .number()
      .describe("Montant de l’amende forfaitaire en euros"),

    increased_amount_eur: z
      .number()
      .describe("Montant de l’amende majorée en euros"),

    payment_deadline_days: z
      .number()
      .describe("Délai de paiement avant majoration"),

    points_removed: z
      .number()
      .describe("Nombre de points retirés du permis")
  }).describe("Sanctions financières et administratives"),

  payment_and_contestation: z.object({
    payment_required_for_admission: z
      .boolean()
      .describe("Le paiement vaut reconnaissance de l’infraction"),

    payment_website: z
      .string()
      .describe("Site officiel de paiement"),

    contestation_website: z
      .string()
      .describe("Site officiel de contestation"),

    contestation_requires_no_payment: z
      .boolean()
      .describe("La contestation doit être faite sans paiement préalable"),

    contestation_address: z.object({
      recipient: z
        .string()
        .describe("Destinataire de la contestation"),

      street: z
        .string()
        .describe("Adresse postale de contestation"),

      postal_code: z
        .string()
        .describe("Code postal"),

      city: z
        .string()
        .describe("Ville")
    }).describe("Adresse de contestation")
  }).describe("Modalités de paiement et de contestation"),

  postal_information: z.object({
    delivery_service: z
      .string()
      .describe("Service de distribution du courrier"),

    postal_center_code: z
      .string()
      .optional()
      .describe("Code du centre postal")
  }).describe("Informations postales"),

  data_protection: z.object({
    personal_data_processing: z
      .boolean()
      .describe("Indique si des données personnelles sont traitées"),

    data_retention_years: z
      .number()
      .optional()
      .describe("Durée de conservation des données"),

    data_controller: z
      .string()
      .optional()
      .describe("Responsable du traitement des données")
  }).describe("Protection des données personnelles")
});
