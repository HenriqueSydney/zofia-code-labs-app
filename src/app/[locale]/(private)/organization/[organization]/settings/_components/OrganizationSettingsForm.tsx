"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  Upload,
  Building,
  Globe,
  Search,
  AlertTriangle,
  Lock, // Importei o cadeado para indicar visualmente
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FormMaskInput } from "@/components/form/FormMaskInput";
import { fetchAddressByCep } from "@/services/cep/cepService";
import { FormInput } from "@/components/form/FormInput";

// Schema (Mantido igual)
const settingsSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hífens"),
  logoUrl: z.string().optional(),
  cnpj: z.string().optional(),
  zipCode: z.string().min(9, "CEP inválido"),
  street: z.string().min(1, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().length(2, "UF inválida"),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

// Tipo para controlar o estado dos campos de endereço
type AddressMode = "initial" | "found" | "manual";

interface OrganizationSettingsFormProps {
  initialData: any;
}

export function OrganizationSettingsForm({
  initialData,
}: OrganizationSettingsFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  // Estado para controlar o comportamento dos inputs
  // Se já tiver dados salvos (edição), começamos como 'manual' ou 'found' para permitir edição?
  // Geralmente em edição de settings, se já tem dados, deixamos como 'found' (parcialmente bloqueado) ou 'initial'
  // Vou assumir 'initial' se não tiver endereço, e 'found' se já tiver endereço salvo validado.
  const savedAddress = initialData.settings?.address || {};
  const hasSavedAddress = !!savedAddress.zipCode;

  const [addressMode, setAddressMode] = useState<AddressMode>(
    hasSavedAddress ? "found" : "initial",
  );

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: initialData.name,
      slug: initialData.slug,
      logoUrl: initialData.settings?.logoUrl || "",
      cnpj: initialData.cnpj || "",
      zipCode: savedAddress.zipCode || "",
      street: savedAddress.street || "",
      number: savedAddress.number || "",
      complement: savedAddress.complement || "",
      neighborhood: savedAddress.neighborhood || "",
      city: savedAddress.city || "",
      state: savedAddress.state || "",
    },
  });

  async function handleCepSearch() {
    const cep = form.getValues("zipCode");

    if (!cep || cep.replace(/\D/g, "").length !== 8) {
      toast.error("CEP inválido. Digite os 8 números.");
      return;
    }

    setIsLoadingCep(true);
    try {
      const address = await fetchAddressByCep(cep);

      form.setValue("street", address.street);
      form.setValue("neighborhood", address.neighborhood);
      form.setValue("city", address.city);
      form.setValue("state", address.state);

      // SUCESSO: Trava Cidade/UF/Bairro, mas libera Rua (para CEP genérico) e Número
      setAddressMode("found");

      form.setFocus("number");
    } catch (error) {
      // ERRO: Libera tudo para edição manual
      setAddressMode("manual");

      toast.error("CEP não encontrado. Preencha o endereço manualmente.");
      // Foca na rua para o usuário começar a digitar
      form.setFocus("street");
    } finally {
      setIsLoadingCep(false);
    }
  }

  async function onSubmit(data: SettingsFormData) {
    setIsPending(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      toast.success("Configurações atualizadas com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar configurações.");
    } finally {
      setIsPending(false);
    }
  }

  const handleLogoUpload = () => {
    toast.info("Funcionalidade de upload será integrada ao storage.");
  };

  // Helper para verificar se campos "fixos" (Cidade/UF/Bairro) devem ser ReadOnly
  // Eles são ReadOnly no início OU se o CEP foi encontrado com sucesso
  const isFixedFieldReadOnly =
    addressMode === "initial" || addressMode === "found";

  // Helper para verificar se campos "variáveis" (Rua) devem ser ReadOnly
  // A rua só é ReadOnly no estado inicial. Se achou (found) ou erro (manual), ela abre.
  const isStreetReadOnly = addressMode === "initial";

  const zipCodeValue = form.watch("zipCode");

  // Effect: Dispara busca ao completar 8 dígitos (sem máscara ou com máscara completa)
  useEffect(() => {
    const cleanCep = zipCodeValue?.replace(/\D/g, "");
    if (cleanCep?.length === 8) {
      handleCepSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zipCodeValue]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
            <CardDescription>
              Gerencie a identidade visual e os dados fiscais da sua
              organização.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* ... SEÇÃO 1: IDENTIDADE (Mantida igual) ... */}
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 border-2">
                  <AvatarImage src={form.watch("logoUrl")} />
                  <AvatarFallback className="text-xl font-bold bg-muted">
                    {initialData.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Logotipo da Empresa</h4>
                  <p className="text-xs text-muted-foreground max-w-[200px]">
                    Recomendado: PNG ou JPG, min 400x400px. Máx 2MB.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleLogoUpload}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Alterar Logo
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormInput
                  label="Nome da Organização"
                  control={form.control}
                  name="name"
                  Icon={Building}
                  description="Nome exibido em documentos e relatórios."
                />

                <FormInput
                  label="URL da Organização (Slug)"
                  control={form.control}
                  name="slug"
                  Icon={Globe}
                  description={`${form.watch("slug")}.zofiacodelabs.com.br`}
                />
              </div>

              {form.watch("slug") !== initialData.slug && (
                <Alert
                  variant="destructive"
                  className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                >
                  <AlertTriangle className="h-4 w-4 stroke-yellow-600" />
                  <AlertTitle>Atenção</AlertTitle>
                  <AlertDescription>
                    Alterar o slug mudará a URL de acesso de todos os membros.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Separator />

            {/* ================= SEÇÃO 2: ENDEREÇO E FATURAMENTO ================= */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium leading-none mb-2">
                  Endereço e Faturamento
                </h3>
                <p className="text-sm text-muted-foreground">
                  Dados utilizados para emissão de notas fiscais.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormMaskInput
                  label="CNPJ"
                  control={form.control}
                  name="cnpj"
                  mask="##.###.###/####-##"
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div className="grid md:grid-cols-4 gap-4 items-start">
                <div className="flex gap-2 items-end">
                  <FormMaskInput
                    label="CEP"
                    control={form.control}
                    name="zipCode"
                    mask="#####-###"
                    placeholder="00000-000"
                    // O CEP sempre pode ser editado para iniciar uma nova busca
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCepSearch}
                    disabled={isLoadingCep}
                    className="mb-[2px]"
                  >
                    {isLoadingCep ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              {/* Dica visual para o usuário */}
              <div className="flex items-center">
                {addressMode === "initial" && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Busque o CEP para preencher o endereço.
                  </p>
                )}
                {addressMode === "manual" && (
                  <p className="text-xs text-yellow-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    CEP não encontrado. Preenchimento manual liberado.
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                {/* Campos Fixos do CEP (Bloqueados se achou CEP, Liberados se Manual) */}
                <div className="col-span-2">
                  <FormInput
                    label="Cidade"
                    control={form.control}
                    name="city"
                    readOnly={isFixedFieldReadOnly}
                    className={isFixedFieldReadOnly ? "opacity-70" : ""}
                    tabIndex={isFixedFieldReadOnly ? -1 : 0}
                  />
                </div>

                <FormInput
                  label="UF"
                  control={form.control}
                  name="state"
                  maxLength={2}
                  placeholder="UF"
                  readOnly={isFixedFieldReadOnly}
                  className={isFixedFieldReadOnly ? "opacity-70" : ""}
                  tabIndex={isFixedFieldReadOnly ? -1 : 0}
                />

                <FormInput
                  label="Bairro"
                  control={form.control}
                  name="neighborhood"
                  readOnly={isFixedFieldReadOnly}
                  className={isFixedFieldReadOnly ? "opacity-70" : ""}
                  tabIndex={isFixedFieldReadOnly ? -1 : 0}
                />
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="col-span-2">
                  {/* Rua: Bloqueada apenas no início. Se achou ou erro, libera (alguns CEPs não tem rua exata) */}
                  <FormInput
                    label="Logradouro (Rua, Av.)"
                    control={form.control}
                    name="street"
                    readOnly={isStreetReadOnly}
                    className={isStreetReadOnly ? "opacity-70" : ""}
                  />
                </div>

                {/* Número e Complemento sempre liberados */}
                <FormInput
                  label="Número"
                  control={form.control}
                  name="number"
                />
                <FormInput
                  label="Complemento"
                  control={form.control}
                  name="complement"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t bg-muted/5 py-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground hidden sm:block">
              Certifique-se de salvar as alterações.
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => form.reset()}
              >
                Descartar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
