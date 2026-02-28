import { SubmitFineForm } from '@/components/submit-fine-form'

export default function SubmitFinePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-4xl font-bold text-foreground">
            Soumettre votre amende
          </h1>
          <p className="text-lg text-muted-foreground">
            Téléchargez votre avis de contravention et laissez notre IA analyser vos chances de succès
          </p>
        </div>

        <SubmitFineForm />
      </div>
    </div>
  )
}
