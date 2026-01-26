export function ProposalDetailsModalSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6  animate-pulse">
      {/* COLUNA DA ESQUERDA (Conteúdo da Proposta) */}
      <div className="md:col-span-2 space-y-6">
        <div className="bg-[#111114]/50 border border-white/5 rounded-xl p-8 space-y-8">
          {/* Header do Card */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-white/10 rounded" />
            <div className="w-48 h-7 bg-white/10 rounded-md" />
          </div>

          {/* Detalhes da Emissão e Validade */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="w-32 h-4 bg-white/5 rounded" />
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white/10 rounded-full" />
                <div className="w-40 h-4 bg-white/10 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white/10 rounded-full" />
                <div className="w-32 h-4 bg-white/10 rounded" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="w-32 h-4 bg-white/5 rounded" />
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white/10 rounded-full" />
                <div className="w-28 h-4 bg-white/10 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white/10 rounded-full" />
                <div className="w-24 h-4 bg-white/10 rounded" />
              </div>
            </div>
          </div>

          {/* Tabela de Serviços */}
          <div className="space-y-6">
            <div className="w-40 h-6 bg-white/10 rounded-md" />
            <div className="border border-white/5 rounded-lg overflow-hidden">
              <div className="h-12 bg-white/5 border-b border-white/5 px-4 flex items-center justify-between">
                <div className="w-24 h-4 bg-white/10 rounded" />
                <div className="flex gap-12">
                  <div className="w-16 h-4 bg-white/10 rounded" />
                  <div className="w-16 h-4 bg-white/10 rounded" />
                </div>
              </div>
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 border-b border-white/5 px-4 flex items-center justify-between last:border-0"
                >
                  <div className="w-64 h-5 bg-white/10 rounded" />
                  <div className="flex gap-12">
                    <div className="w-20 h-5 bg-white/10 rounded" />
                    <div className="w-20 h-5 bg-white/10 rounded font-bold" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo de Valores (Direita) */}
          <div className="flex justify-end">
            <div className="w-80 h-40 bg-white/5 rounded-2xl p-6 space-y-6 border border-white/5">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="w-20 h-4 bg-white/10 rounded" />
                  <div className="w-24 h-3 bg-white/5 rounded" />
                </div>
                <div className="w-24 h-6 bg-white/10 rounded" />
              </div>
              <div className="flex justify-between items-end pt-4">
                <div className="w-28 h-5 bg-white/10 rounded" />
                <div className="w-32 h-8 bg-white/10 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COLUNA DA DIREITA (Documento e Envio) */}
      <div className="flex flex-col space-y-4">
        {/* Documento Gerado */}
        <div className="bg-[#111114]/50 border border-white/5 rounded-xl p-6 space-y-4">
          <div className="w-40 h-5 bg-white/10 rounded" />
          <div className="w-32 h-3 bg-white/5 rounded" />
          <div className="h-16 bg-white/5 border border-white/10 rounded-lg flex items-center px-4 gap-4">
            <div className="w-8 h-8 bg-white/10 rounded" />
            <div className="space-y-2">
              <div className="w-24 h-4 bg-white/10 rounded" />
              <div className="w-16 h-3 bg-white/5 rounded" />
            </div>
          </div>
        </div>

        {/* Canal de Envio */}
        <div className="flex-1 bg-[#111114]/50 border border-white/5 rounded-xl p-6 space-y-6">
          <div className="w-32 h-5 bg-white/10 rounded" />
          <div className="w-48 h-3 bg-white/5 rounded pb-2" />

          <div className="space-y-3">
            <div className="h-14 bg-white/5 border border-purple-500/30 rounded-lg flex items-center px-4 gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-purple-500/50" />
              <div className="w-20 h-4 bg-white/10 rounded" />
            </div>
            <div className="h-14 bg-white/5 border border-white/5 rounded-lg flex items-center px-4 gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-white/10" />
              <div className="w-24 h-4 bg-white/10 rounded" />
            </div>
          </div>

          <div className="h-12 bg-purple-600/30 rounded-xl w-full mt-4" />
        </div>
      </div>
    </div>
  );
}
