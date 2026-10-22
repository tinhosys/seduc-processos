# RELATÓRIO DE AUDITORIA DE PARCERIAS - ANTIGRAVITY v2.0

* **Referência Oficial do Script:** [Google Docs - Script AntiGravity v2.0](https://docs.google.com/document/d/1QC2IifPCQDgn01796k1Zo_e9fJRpbb59/edit)
* **Agente Responsável:** `AntiGravity_Convenio_Auditor v2.0.0`
* **Domínio de Aplicação:** Análise de Convênios, Termos de Fomento, Termos de Colaboração e Repasses Públicos (Lei Federal nº 13.019/2014 e legislação estadual/municipal aplicável).

---

## 1. DADOS IDENTIFICADORES
* **Processo:** `[Número do Processo SEI]`
* **Entidade Proponente:** `[Nome da Entidade / Conselho Escolar / Município]`
* **Data da Análise:** `22/10/2026`
* **Auditor Responsável:** Agente AntiGravity v2.0

---

## 2. QUADRO RESUMO DE CONFORMIDADE (VALIDAÇÃO CRUZADA DOC A x DOC B)

| Item Auditado | Documento A (Ofício de Solicitação) | Documento B (Plano de Trabalho / Aplicação) | Status | Severidade |
| :--- | :--- | :--- | :--- | :--- |
| **Unidade Beneficiária** | Unidade Escolar / Entidade Solicitante | Mesma Entidade no Plano de Trabalho | ✅ OK | Baixa |
| **Valor Global [Regra FIN-01]** | Valor Solicitado no Ofício (`VALOR_TOTAL_DOC_A`) | Soma do Plano de Aplicação (`VALOR_TOTAL_DOC_B`) | ❌ FALHA / ✅ OK | Alta |
| **Signatário [Regra REP-03]** | Signatário do Ofício (`NOME_SIGNATARIO_A`) | Responsável Legal no Plano (`NOME_SIGNATARIO_B`) | ❌ FALHA / ✅ OK | Alta |
| **Escopo dos Bens [Regra OBJ-02]** | Lista de Itens Citados no Ofício (`lista_A`) | Relação Oficial do Plano de Aplicação (`lista_B`) | ⚠️ AVISO / ✅ OK | Média |

---

## 3. DETALHAMENTO DAS DIVERGÊNCIAS (REGRAS DE NEGÓCIO EXECUTADAS)

1. **Divergência Financeira (`[REGRA FIN-01: EQUIVALÊNCIA FINANCEIRA]`):**
   * Cálculo: $\text{DIFERENCA\_VALOR} = |\text{VALOR\_TOTAL\_DOC\_A} - \text{VALOR\_TOTAL\_DOC\_B}|$
   * Quando $\text{DIFERENCA\_VALOR} > 0,00$, sinaliza **`[CRÍTICO] - Exige Adequação Orçamentária`**, impedindo a aprovação imediata da nota de empenho sem prévia retificação.

2. **Divergência de Escopo Material (`[REGRA OBJ-02: COERÊNCIA E ESCOPO DO OBJETO]`):**
   * Cotejo entre os bens exemplificados na justificativa do Ofício (`lista_A`) e os itens efetivamente orçados no quadro *Plano de Aplicação* (`lista_B`).
   * Quando há itens citados no Ofício ausentes no Plano (ou itens de alta relevância no Plano não justificados no Ofício), sinaliza **`[MÉDIO] - Requer Alinhamento Descritivo do Objeto`**.

3. **Divergência de Representação e Competência (`[REGRA REP-03: LEGITIMIDADE DA REPRESENTAÇÃO LEGAL]`):**
   * Comparação estrita entre Nomes, Cargos e Atos de Designação/Posse dos signatários de ambos os instrumentos.
   * Quando $\text{NOME\_SIGNATARIO\_A} \neq \text{NOME\_SIGNATARIO\_B}$ ou ausente o ato constitutivo/portaria, sinaliza **`[ALTO] - Solicitada Comprovação de Representação/Ata`**.

4. **Módulo de Tratamento de Erros (`Exception Handling`):**
   * `ERR_OCR_UNREADABLE`: Documento com baixa resolução ou assinatura sobreposta ao texto.
   * `ERR_MISSING_SECTION`: Ausência do quadro *Plano de Aplicação* no Plano de Trabalho.
   * `ERR_CURRENCY_FORMAT`: Valores expressos de forma divergente entre algarismos e extenso.

---

## 4. MINUTA DE NOTIFICAÇÃO ADMINISTRATIVA (PRONTA PARA USO)

> **À Entidade Proponente:** [Nome da Entidade Proponente]
> **Assunto:** Diligência Técnica de Adequação Documental — Processo nº [Número SEI] ([Número do Ofício])
>
> Prezado(a) Responsável,
>
> Em análise técnica preliminar à documentação apresentada visando a celebração de parceria para atendimento à unidade **[Unidade Beneficiária]**, identificamos impropriedades formais e técnicas que necessitam de saneamento para o regular prosseguimento do feito:
>
> 1. **Retificação de Valor [Regra FIN-01]:** Adequar o Ofício de Solicitação ou a Planilha do Plano de Trabalho para que reflitam exatamente o mesmo valor global.
> 2. **Alinhamento do Objeto [Regra OBJ-02]:** Compatibilizar o texto descritivo do Ofício com os itens efetivamente listados no Plano de Aplicação, garantindo que todos os bens pretendidos estejam devidamente justificados.
> 3. **Regularização de Signatários [Regra REP-03]:** Apresentar cópia da Ata de Eleição/Posse ou Portaria de Designação vigente e unificar o responsável legal signatário entre o Ofício e o Plano de Trabalho.
>
> Concede-se o prazo de **05 (cinco) dias úteis** para a juntada dos documentos retificados no Sistema Eletrônico de Informações (SEI).
>
> Atenciosamente,
> **Setor de Análise Técnica de Parcerias e Convênios — SEDUC/RO (CAM/GDSM)**
