import { useState } from 'react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Toggle from '../ui/Toggle'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'
import type { Card, ColumnId, VehicleType } from '../../types'

const VEHICLE_OPTIONS = [
  { value: 'carro', label: 'Carro' },
  { value: 'moto', label: 'Moto' },
  { value: 'caminhao', label: 'Caminhão' },
]

const COLUMN_OPTIONS = [
  { value: 'contact',            label: 'Entrar em contato' },
  { value: 'contacted',          label: 'Contato feito' },
  { value: 'proposal',           label: 'Proposta enviada' },
  { value: 'waiting_inspection', label: 'Aguardando Vistoria' },
  { value: 'done',               label: 'Concluído' },
]

type CardPayload = Omit<Card, 'id' | 'user_id' | 'position' | 'created_at' | 'column'>

interface FormState {
  name: string
  phone: string
  plate: string
  vehicle_type: VehicleType | ''
  vehicle_model: string
  referral: boolean
  referral_name: string
  insurance_activation: string
  insurance_monthly: string
  tracker: boolean
  tracker_value: string
  notes: string
}

const EMPTY_FORM: FormState = {
  name: '',
  phone: '',
  plate: '',
  vehicle_type: '',
  vehicle_model: '',
  referral: false,
  referral_name: '',
  insurance_activation: '',
  insurance_monthly: '',
  tracker: false,
  tracker_value: '',
  notes: '',
}

interface CardFormProps {
  initialData?: Card | null
  onSubmit: (payload: CardPayload, column?: ColumnId) => void
  onDelete?: (() => void) | null
  loading?: boolean
}

export default function CardForm({ initialData, onSubmit, onDelete, loading }: CardFormProps) {
  const [column, setColumn] = useState<ColumnId>(initialData?.column ?? 'contact')
  const [form, setForm] = useState<FormState>(() => ({
    ...EMPTY_FORM,
    ...(initialData ? {
      name: initialData.name,
      phone: initialData.phone ?? '',
      plate: initialData.plate ?? '',
      vehicle_type: initialData.vehicle_type ?? '',
      vehicle_model: initialData.vehicle_model ?? '',
      referral: initialData.referral,
      referral_name: initialData.referral_name ?? '',
      tracker: initialData.tracker,
      notes: initialData.notes ?? '',
    } : {}),
    insurance_activation: initialData?.insurance_activation != null ? String(initialData.insurance_activation) : '',
    insurance_monthly: initialData?.insurance_monthly != null ? String(initialData.insurance_monthly) : '',
    tracker_value: initialData?.tracker_value != null ? String(initialData.tracker_value) : '',
  }))
  const [errors, setErrors] = useState<Record<string, string>>({})

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Nome obrigatório'
    return errs
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const payload: CardPayload = {
      name: form.name.trim(),
      phone: form.phone || null,
      plate: form.plate || null,
      vehicle_type: (form.vehicle_type as VehicleType) || null,
      vehicle_model: form.vehicle_model || null,
      referral: form.referral,
      referral_name: form.referral ? (form.referral_name || null) : null,
      insurance_activation: form.insurance_activation !== '' ? Number(form.insurance_activation) : null,
      insurance_monthly: form.insurance_monthly !== '' ? Number(form.insurance_monthly) : null,
      tracker: form.tracker,
      tracker_value: form.tracker ? (form.tracker_value !== '' ? Number(form.tracker_value) : null) : null,
      notes: form.notes || null,
    }
    onSubmit(payload, column)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Etapa */}
      <Select
        label="Etapa"
        name="column"
        value={column}
        onChange={(e) => setColumn(e.target.value as ColumnId)}
        options={COLUMN_OPTIONS}
      />

      {/* Dados do cliente */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Cliente</p>
        <Input label="Nome" name="name" value={form.name} onChange={handleChange} error={errors.name} required placeholder="Nome completo" />
        <Input label="Telefone" name="phone" value={form.phone} onChange={handleChange} placeholder="(00) 00000-0000" type="tel" />
      </div>

      {/* Dados do veículo */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Veículo</p>
        <Input label="Placa" name="plate" value={form.plate} onChange={handleChange} placeholder="ABC-1234" className="uppercase" />
        <Select
          label="Tipo de veículo"
          name="vehicle_type"
          value={form.vehicle_type}
          onChange={handleChange}
          options={VEHICLE_OPTIONS}
          placeholder="Selecionar..."
        />
        <Input label="Modelo" name="vehicle_model" value={form.vehicle_model} onChange={handleChange} placeholder="Ex: Honda Civic 2022" />
      </div>

      {/* Seguro */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Seguro</p>
        <Input
          label="Valor da ativação (R$)"
          name="insurance_activation"
          value={form.insurance_activation}
          onChange={handleChange}
          type="number"
          min="0"
          step="0.01"
          placeholder="0,00"
        />
        <Input
          label="Mensalidade cotada (R$)"
          name="insurance_monthly"
          value={form.insurance_monthly}
          onChange={handleChange}
          type="number"
          min="0"
          step="0.01"
          placeholder="0,00"
        />
      </div>

      {/* Rastreador */}
      <div className="flex flex-col gap-3">
        <Toggle label="Possui rastreador?" checked={form.tracker} onChange={(v) => set('tracker', v)} />
        {form.tracker && (
          <Input
            label="Valor do rastreador (R$)"
            name="tracker_value"
            value={form.tracker_value}
            onChange={handleChange}
            type="number"
            min="0"
            step="0.01"
            placeholder="0,00"
          />
        )}
      </div>

      {/* Indicação */}
      <div className="flex flex-col gap-3">
        <Toggle label="Veio por indicação?" checked={form.referral} onChange={(v) => set('referral', v)} />
        {form.referral && (
          <Input
            label="Nome de quem indicou"
            name="referral_name"
            value={form.referral_name}
            onChange={handleChange}
            placeholder="Nome do indicador"
          />
        )}
      </div>

      {/* Observações */}
      <Textarea label="Observações" name="notes" value={form.notes} onChange={handleChange} placeholder="Anotações adicionais..." />

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        {onDelete && (
          <Button type="button" variant="danger" size="sm" onClick={onDelete} className="mr-auto">
            Excluir
          </Button>
        )}
        <Button type="submit" loading={loading} className="flex-1">
          {initialData ? 'Salvar alterações' : 'Criar card'}
        </Button>
      </div>
    </form>
  )
}
