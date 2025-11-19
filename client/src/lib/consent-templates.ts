export interface ConsentTemplate {
  id: string;
  name: string;
  fields?: string;
  text: string;
}

export const consentTemplates: Record<string, ConsentTemplate> = {
  lipolytic: {
    id: "lipolytic",
    name: "Lipolytic Injections",
    fields: `
      <div class="treatment-specific-fields">
        <label class="form-label font-bold">Select Treatment Area(s):</label>
        <div class="grid grid-cols-2 gap-3 mt-2">
          <label class="flex items-center">
            <input type="checkbox" name="treatment-area" value="chin" class="mr-2">
            <span class="text-sm">Beneath the chin</span>
          </label>
          <label class="flex items-center">
            <input type="checkbox" name="treatment-area" value="cheeks" class="mr-2">
            <span class="text-sm">Cheeks</span>
          </label>
          <label class="flex items-center">
            <input type="checkbox" name="treatment-area" value="arms" class="mr-2">
            <span class="text-sm">Under arms</span>
          </label>
          <label class="flex items-center">
            <input type="checkbox" name="treatment-area" value="waist" class="mr-2">
            <span class="text-sm">Waist (love handles)</span>
          </label>
          <label class="flex items-center">
            <input type="checkbox" name="treatment-area" value="abdomen" class="mr-2">
            <span class="text-sm">Abdomen</span>
          </label>
          <label class="flex items-center">
            <input type="checkbox" name="treatment-area" value="thighs" class="mr-2">
            <span class="text-sm">Inner/outer thighs</span>
          </label>
        </div>
      </div>
    `,
    text: `
      <h4 class="text-lg font-semibold mb-4">CONSENT FOR LIPOLYTIC INJECTIONS</h4>
      <p class="mb-3">I hereby authorize Phindie Mbeki Healthcare to perform fat dissolving injections, for the purpose of reducing unsightly, undesirable, problematic and unhealthy excessive fat deposits in the area(s) selected above.</p>
      <h5 class="font-semibold mt-4 mb-2">I FULLY UNDERSTAND AND ACKNOWLEDGE THAT:</h5>
      <ul class="list-disc pl-6 mb-3 space-y-1">
        <li>I am freely choosing to undertake this procedure at my own risk.</li>
        <li>I am solely responsible for the complications and to attend my schedule appointment.</li>
        <li>I understand that the failure to not attend my appointment may affect the results of the treatment.</li>
        <li>I may require further, repeat treatment beyond what has been initially planned, to achieve satisfactory results and I will require to pay a fee for every treatment session.</li>
        <li>Treatment, such as that to which I have consented to receive, are medical procedures that carry with them certain potential complications or side effects.</li>
        <li>I understand that after the procedure my ability to function daily activities and I undertake the treatment solely at my own risk.</li>
        <li>I have received detailed information, in clear terms, regarding the contraindications, potential complications and side effects of the treatment.</li>
        <li>I have been given the opportunity to ask questions about the treatment and I now fully understand and accept the benefits and the side effects both immediate and long-term, general and specific, which this procedure may cause.</li>
        <li>These may include permanent, or temporary, general or specific risks reported in the clinical studies such as: Pain, Swelling, Redness, Burning, Stinging, Tenderness, Bleeding, Headache, Nausea, Facial and neck muscle weakness, nerve damage, numbness, areas of skin harden, skin and muscle laceration, scarring, allergic reaction, increased skin laxity, infection and discolouration of the skin.</li>
        <li>Should complications occur because of the treatment I received, I may require emergency medical treatment, and I am aware that I am solely responsible for any costs associated with such required treatment and this is not necessarily the results of the treatment or mistreatment received, but rather it is a potential when receiving any medical treatment.</li>
        <li>When giving the medical history, I have done so to the best of my knowledge, without withholding any information, as doing so may compromise the treatment provided and my health, for I am fully responsible.</li>
        <li>I understand that treatment results cannot be guaranteed and may be temporary in nature, requiring re-treatment in the future, though this will vary depending on various personal circumstances and area being treated.</li>
        <li>I understand that best results are achieved when I commit to healthy lifestyle, diet and exercise.</li>
      </ul>
    `,
  },
  ozempic_mounjaro: {
    id: "ozempic_mounjaro",
    name: "Ozempic/Mounjaro Weight Loss",
    text: `
      <h4 class="text-lg font-semibold mb-4">IMPORTANT INFORMATION & CONSENT TO OZEMPIC/MOUNJARO® TREATMENT</h4>
      <p class="mb-3">Ozempic/Mounjaro® is a medicine that contains an active substance called tirzepatide.</p>
      <h5 class="font-semibold mt-4 mb-2">How it works:</h5>
      <p class="mb-3">Ozempic/Mounjaro® works on two different hormonal receptors that help regulate your appetite: glucagon-like peptide-1 (GLP-1) and glucose-dependent insulinotropic polypeptide (GIP). It primarily works by regulating your appetite, giving you a sense of satiety ('fullness'), making you feel less hungry and experience less food cravings. This will help you eat less food and reduce your body weight. It should be used with a reduced-calorie diet and increased physical activity.</p>
      <h5 class="font-semibold mt-4 mb-2">How to use it:</h5>
      <p class="mb-3">The starting dose is 2.5mg once a week for four weeks. Your dose will be gradually increased every 4 weeks, depending on side effects and tolerance of the treatment. The maximum dose is 15mg weekly. It is given as an injection under the skin (subcutaneous injection). If you miss a dose and it has been 4 days or less, take it as soon as you remember. If it has been more than 4 days, skip the missed dose. The minimum time between two doses must be at least 3 days.</p>
      <h5 class="font-semibold mt-4 mb-2">SIDE EFFECTS:</h5>
      <p class="mb-3">Like all medicines, Ozempic/Mounjaro® can cause side effects. It is important to avoid dehydration by drinking plenty of fluids.</p>
      <ul class="list-disc pl-6 mb-3 space-y-1">
        <li><strong>Very Common:</strong> Nausea, diarrhoea, vomiting, constipation, hypoglycaemia.</li>
        <li><strong>Common:</strong> Dizziness, decreased appetite, abdominal pain, indigestion, bloating, fatigue, hair loss, injection site reactions.</li>
        <li><strong>Uncommon:</strong> Gallstones, cholecystitis, acute pancreatitis.</li>
        <li><strong>Rare but serious:</strong> Severe allergic reactions (anaphylactic reaction, angioedema). Seek immediate medical help for symptoms like breathing problems or rapid swelling.</li>
        <li><strong>Eye side effects:</strong> A potential link to NAION, which can cause sudden vision loss. See a doctor immediately if you experience eye symptoms.</li>
      </ul>
      <h5 class="font-semibold mt-4 mb-2">Nutritional consequences:</h5>
      <p class="mb-3">The restricted diet may cause nutrient shortages. You have been made aware of the need to take multivitamin/mineral supplementation and sometimes vitamin B12 injections during treatment, and the need for follow-up blood tests.</p>
      <h5 class="font-semibold mt-4 mb-2">WARNINGS AND PRECAUTIONS:</h5>
      <p class="mb-3">Consult your healthcare provider before use if you have severe digestion problems, liver or kidney disease, pancreatitis, eye problems, or use other weight loss/diabetes medicines. Do not use if pregnant, planning pregnancy, or breast-feeding. Use additional contraception for 4 weeks after starting and after each dose increase.</p>
      <h5 class="font-semibold mt-4 mb-2">ACKNOWLEDGEMENT:</h5>
      <p><strong>I HAVE READ AND UNDERSTOOD ALL OF THE ABOVE INFORMATION AND CONSENT TO OZEMPIC/MOUNJARO TREATMENT.</strong></p>
    `,
  },
  skin_removal: {
    id: "skin_removal",
    name: "Skin Tag/Mole/Wart Removal",
    fields: `
      <div class="treatment-specific-fields">
        <div class="space-y-4">
          <div>
            <label class="form-label font-bold">Chronic or current Acute illnesses:</label>
            <input type="text" name="med_illnesses" class="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent mt-1">
          </div>
          <div>
            <label class="form-label font-bold">Current Medication & Supplements:</label>
            <input type="text" name="med_supplements" class="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent mt-1">
          </div>
          <div>
            <label class="form-label font-bold">Do you have a history of excessive scarring or keloids?</label>
            <input type="text" name="med_keloids" placeholder="YES/NO and specify" class="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent mt-1">
          </div>
          <div>
            <label class="form-label font-bold">Are you currently under the care of a dermatologist or other medical care?</label>
            <input type="text" name="med_dermatologist" placeholder="YES/NO and specify" class="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent mt-1">
          </div>
          <div>
            <label class="form-label font-bold">Please explain any previous skin procedures, particularly skin tag removal:</label>
            <textarea name="med_previous_procedures" rows="3" class="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent mt-1"></textarea>
          </div>
          <div>
            <label class="form-label font-bold">List any known allergies (include medication & latex):</label>
            <input type="text" name="med_allergies" class="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent mt-1">
          </div>
          <hr class="my-4">
          <div>
            <label class="form-label font-bold">Location(s) of skin tags:</label>
            <input type="text" name="skin_location" class="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent mt-1">
          </div>
          <div>
            <label class="form-label font-bold">Estimated number for removal:</label>
            <input type="number" name="skin_number" class="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent mt-1">
          </div>
          <div>
            <label class="form-label font-bold">Have any changed colour or size recently?</label>
            <input type="text" name="skin_changes" placeholder="YES/NO" class="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent mt-1">
          </div>
        </div>
      </div>
    `,
    text: `
      <h4 class="text-lg font-semibold mb-4">SKIN TAGS/ MOLES/ WARTS/ FRECKLES REMOVAL CONSENT FORM</h4>
      <p class="mb-3">I hereby authorize PHINDIE MBEKI HEALTHCARE to perform skin tag/ mole/ warts removal by plasma pen on me, and release PHINDIE MBEKI HEALTHCARE from all liabilities associated with the procedure mentioned above.</p>
      <h5 class="font-semibold mt-4 mb-2">The following problems may occur with the treatments:</h5>
      <ul class="list-disc pl-6 mb-3 space-y-1">
        <li>There is a risk of scarring.</li>
        <li>Short term effects may include reddening, mild burning, temporary bruising or blistering. Hyper/hypopigmentation may be noted after the treatment. These effects usually resolve within 2-6 weeks, but permanent colour change is a rare risk. Avoiding sun exposure before and after the treatment reduces the risk of colour change.</li>
        <li><strong>Infection:</strong> Although infection after the treatment is unusual, inflammation of the treated area can occur and can result into infection.</li>
        <li><strong>Bleeding:</strong> Pinpoint bleeding is rare but can occur during and following the procedure.</li>
        <li><strong>Allergic Reactions:</strong> In rare cases, local allergies to tape, preservatives used or topical preparations have been reported.</li>
        <li>Compliance with aftercare guidelines is crucial for healing, prevention of scarring, and hyperpigmentation.</li>
        <li>There is also the possibility that other side effects or complications not presently known, recognized, described to me now or understood may develop now or in future.</li>
        <li>Other rare risks include Purpura (purple bruising), Pigment change, Crusting/scab, and failure to improve quality of life.</li>
      </ul>
      <h5 class="font-semibold mt-4 mb-2">ACKNOWLEDGEMENT:</h5>
      <p><strong>I understand that there are no guarantees and that I am releasing PHINDIE MBEKI HEALTHCARE from all liabilities. My questions regarding the procedure have been answered satisfactorily. I understand the procedure and accept the risks.</strong></p>
    `,
  },
  iv_therapy: {
    id: "iv_therapy",
    name: "IV Therapy",
    text: `
      <h4 class="text-lg font-semibold mb-4">CONSENT FOR INTRAVENOUS NUTRIENT THERAPY</h4>
      <p class="mb-3">I hereby authorize the administration of intravenous vitamins, minerals, and other nutrients. This procedure is recommended for replacement of these essential nutrients, correction of deficiencies, and for other therapeutic effects, such as improving immune function, improving antioxidant status, reducing oxidative damage, decreasing bronchospasm, improving fatigue, etc.</p>
      <h5 class="font-semibold mt-4 mb-2">The principal side effects that may accompany intravenous administration of nutrients include:</h5>
      <ul class="list-disc pl-6 mb-3 space-y-1">
        <li>-burning and stinging at the site of infusion or if IV infiltrates into surrounding tissue</li>
        <li>-muscular spasms, weakness, or fatigue</li>
        <li>-allergic reactions (rare)</li>
        <li>-local thrombophlebitis (very rare).</li>
      </ul>
      <p class="mb-3">This procedure may be considered medically unnecessary. It may or may not mitigate, alleviate, or cure the condition for which it has been prescribed. This therapy has been recommended to you in the belief that it is of potential benefit in these circumstances and its use will quite probably improve the condition for which you are under treatment and in your overall health.</p>
      <p class="mb-3">I understand that my treatment records and test results may be used as the basis for a published study and consent to such use of my treatment results. I understand that I may suspend or terminate my treatment at anytime by informing my medical provider.</p>
      <p class="mb-3">I assume full liability for any adverse effects that may result from the non-negligent administration of the proposed treatment. I waive any claim in law or equity for redress of any grievance that I may have concerned or resulting from the procedure, except as that claim pertains to negligent administration of this procedure.</p>
      <p class="mb-3">The risks involved and the possibilities of complications have been explained to me. I fully understand and confirm that the nature and purpose of the aforementioned treatment to be provided may be considered unproven by scientific testing and peer-reviewed publications and therefore may be considered medically unnecessary or not currently indicated.</p>
      <p class="mb-3">I hereby place myself under your care for intravenous vitamin therapy, and agree to the above release. I also verify that all information presented to medical provider in my medical history is true to the best of my knowledge.</p>
      <p class="mb-3">I hereby acknowledge that I understand that my Insurance coverage, including Medicare, may not pay for this Non-covered service, and that all services ancillary to this treatment may be also non-covered services and non- reimbursable. I agree to be responsible for payment at the time of service for all services, including non-covered services.</p>
    `,
  },
  tooth_whitening: {
    id: "tooth_whitening",
    name: "Tooth Whitening",
    fields: `
      <div class="treatment-specific-fields">
        <div class="space-y-4">
          <div>
            <label class="form-label font-bold">Carbamide Peroxide Gel Concentration:</label>
            <div class="flex gap-4 mt-2">
              <label class="flex items-center">
                <input type="radio" name="gel_concentration" value="10%" class="mr-2">
                <span class="text-sm">10%</span>
              </label>
              <label class="flex items-center">
                <input type="radio" name="gel_concentration" value="16%" class="mr-2">
                <span class="text-sm">16%</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    `,
    text: `
      <h4 class="text-lg font-semibold mb-4">CONSENT FORM FOR TOOTH WHITENING</h4>
      <p class="mb-3">Tooth whitening is a state of the art procedure designed to whiten the teeth to their optimum natural brightness. We are planning to use Carbamide Peroxide Gel 10% / 16%.</p>
      <p class="mb-3">The amount of whitening varies from patient to patient and cannot be predicted exactly. In general, yellow or brown teeth, teeth with extrinsic staining from tea, coffee or red wine, and darkened monochromatic teeth are easier to whiten.</p>
      
      <h5 class="font-semibold mt-4 mb-2">Tooth Whitening Awareness:</h5>
      <ul class="list-disc pl-6 mb-3 space-y-1">
        <li>As with any treatment there are benefits and risks. The benefit is that teeth can be whitened fairly quickly in a simple manner. The risk involves the continued use of the gel for an extended period of time such as a few years. Research indicates that using peroxide to whiten teeth is safe. There is new research indicating the safety for use on the soft tissues (gingivae, cheek, tongue, throat). The long-term effects are as yet unknown. Although the extent of the risk is unknown, acceptance of treatment means acceptance of risk.</li>
        <li>Fillings and crowns do not change colour and therefore may need replacing afterwards.</li>
        <li>Most patients achieve a change within 2 – 5 weeks.</li>
        <li>Sensitivity may result after a few days. This is usually slight and temporary. If this should occur refrain from using the whitening treatment for 1 day or apply the soothing gel into the tray that you will be given.</li>
      </ul>

      <h5 class="font-semibold mt-4 mb-2">Responsibilities:</h5>
      <ul class="list-disc pl-6 mb-3 space-y-1">
        <li>Avoid tobacco, tea, coffee, red wine and teeth staining foods such as tomato paste, food colourants and deeply coloured toothpastes and mouthwashes for at least 30 minutes after the whitening procedure.</li>
        <li>Proper oral hygiene must be maintained including brushing twice daily and the use of floss.</li>
        <li>Keep your recall appointments with your dentist.</li>
        <li>Do not use the whitening trays if you are pregnant. There have been no reports of adverse reactions, but long term clinical effects are unknown.</li>
        <li>Wear the tray overnight or for a minimum of 2 hours per day (carbamide peroxide). If using hydrogen peroxide wear for a minimum of 30 minutes per day with a view to increasing it to a maximum of 45 minutes per day.</li>
      </ul>

      <h5 class="font-semibold mt-4 mb-2">Guarantees:</h5>
      <ul class="list-disc pl-6 mb-3 space-y-1">
        <li>There are no guarantees to the degree of tooth whitening.</li>
        <li>The amount of teeth whitening depends on the individual and the reason for discolouration.</li>
        <li>Some teeth do not whiten evenly particularly around gum recession on the lower premolar tooth. The enamel whitens well but the dentine does not whiten as well.</li>
        <li>When the treatment is completed, please keep the trays so that they can be used for a top-up maintenance treatment. It may be necessary to do a top-up treatment in 18 - 24 months depending on the amount of staining.</li>
      </ul>

      <h5 class="font-semibold mt-4 mb-2">Patient Acknowledgement:</h5>
      <p class="mb-3">I have had the tooth whitening procedure fully explained to me and have had the opportunity to ask questions. I have read this information sheet.</p>
      <p class="mb-3">I consent to treatment and assume responsibility for the risks described above. I also consent to photographs being taken. I understand that they may be used for documentation and illustration of my whitening treatment.</p>
    `,
  },
};

export function getConsentTemplate(treatmentType: string): ConsentTemplate | null {
  return consentTemplates[treatmentType] || null;
}

export function getAllConsentTemplates(): ConsentTemplate[] {
  return Object.values(consentTemplates);
}
