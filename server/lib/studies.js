/**
 * Study definitions.
 *
 * Each study declares what the assistant needs to know before it can write a
 * report, and the canonical sentence for each answer. The assistant is only as
 * intelligent as this file — adding a new study is data, not code.
 *
 * `asks` are the questions the agent puts to the doctor when the finding blurb
 * does not already address them. `patterns` decide "already addressed": if the
 * doctor wrote "no midline shift", the agent does not ask about midline shift.
 *
 * `negative` is the sentence used when the doctor answers No. It is the
 * department's own wording, so a report assembled from these reads as if it
 * were dictated rather than generated.
 */

export const studies = [
  /* ----------------------------------------------------------- radiology -- */
  {
    id: 'ct-brain',
    specialty: 'radiology',
    name: 'CT Brain',
    hint: 'Plain or contrast, acute or routine',
    contrastOptions: {
      'No contrast':
        'Axial sections of 5 mm thickness are obtained from the base of skull to vertex. No IV contrast is given.',
      'With contrast':
        'Axial sections of 5 mm thickness are obtained from the base of skull to vertex following IV contrast.',
    },
    order: ['haemorrhage', 'infarct', 'mass', 'midline', 'ventricles', 'cisterns', 'bones'],
    asks: [
      {
        id: 'haemorrhage',
        question: 'Any intracranial haemorrhage?',
        options: ['No', 'Yes'],
        patterns: ['haemorrhag', 'hemorrhag', 'bleed', 'haematoma', 'hematoma', 'sah', 'sdh', 'edh', 'extradural', 'subdural', 'contusion'],
        negative: 'No acute intracranial haemorrhage is seen.',
        followUp: 'Where is it, and roughly what size?',
        why: 'The primary question in an acute head CT.',
      },
      {
        id: 'infarct',
        question: 'Any established or acute infarct?',
        options: ['No', 'Yes'],
        patterns: ['infarct', 'ischaem', 'ischem', 'hypodens', 'stroke', 'cva'],
        negative: 'No established infarct or acute ischaemic change is identified.',
        followUp: 'Which territory, and is it acute or established?',
        why: 'Changes management entirely from the haemorrhage pathway.',
      },
      {
        id: 'mass',
        question: 'Any mass lesion or abnormal collection?',
        options: ['No', 'Yes'],
        patterns: ['mass', 'lesion', 'tumour', 'tumor', 'collection', 'abscess', 'metasta'],
        negative: 'No mass lesion or abnormal extra-axial collection is seen.',
        followUp: 'Site, approximate size, and any enhancement?',
        why: 'Needs stating before a study can be called normal.',
      },
      {
        id: 'midline',
        question: 'Any midline shift or mass effect?',
        options: ['No', 'Yes'],
        patterns: ['midline', 'shift', 'mass effect', 'effacement', 'herniat'],
        negative: 'Midline structures are central. No mass effect is noted.',
        followUp: 'How many millimetres, and in which direction?',
        why: 'Decides whether the patient needs urgent neurosurgical review.',
      },
      {
        id: 'ventricles',
        question: 'Ventricular size normal?',
        options: ['Normal', 'Dilated'],
        patterns: ['ventric', 'hydrocephal'],
        negative: 'Ventricular system is normal in size. No hydrocephalus.',
        positiveAnswer: 'Dilated',
        followUp: 'Communicating or obstructive, and is there periventricular change?',
        why: 'Acute hydrocephalus is time-critical and easy to skip on a busy list.',
      },
      {
        id: 'cisterns',
        question: 'Basal cisterns patent?',
        options: ['Patent', 'Effaced'],
        patterns: ['cistern'],
        negative: 'Basal cisterns are patent.',
        positiveAnswer: 'Effaced',
        followUp: 'Which cisterns, and is there uncal herniation?',
        why: 'The earliest sign of raised intracranial pressure.',
      },
      {
        id: 'bones',
        question: 'Skull vault and sinuses clear?',
        options: ['Clear', 'Abnormal'],
        patterns: ['calvari', 'skull', 'bone', 'bony', 'fracture', 'sinus', 'mastoid'],
        negative:
          'Bony calvarium is intact. Visualised paranasal sinuses and mastoid air cells are clear.',
        positiveAnswer: 'Abnormal',
        followUp: 'Fracture, or sinus opacification?',
        why: 'The usual site of a missed incidental finding.',
      },
    ],
  },

  {
    id: 'ct-chest',
    specialty: 'radiology',
    name: 'CT Chest',
    hint: 'Parenchyma, pleura, mediastinum',
    contrastOptions: {
      'No contrast': 'Contiguous axial sections are obtained through the chest. No IV contrast is given.',
      'With contrast':
        'Contiguous axial sections are obtained through the chest following IV contrast, in the venous phase.',
      'CT pulmonary angiogram':
        'CT pulmonary angiogram performed with bolus-tracked contrast in the pulmonary arterial phase.',
    },
    order: ['lungs', 'nodules', 'pleura', 'mediastinum', 'airways', 'bones'],
    asks: [
      {
        id: 'lungs',
        question: 'Any parenchymal abnormality?',
        options: ['No', 'Yes'],
        patterns: ['consolidat', 'ground[- ]?glass', 'fibro', 'collapse', 'atelecta', 'cavit', 'infiltrat', 'reticul', 'emphysem'],
        negative: 'Both lung fields are clear. No consolidation, collapse or interstitial change.',
        followUp: 'Which lobes, and what pattern?',
        why: 'The main reason the study was requested.',
      },
      {
        id: 'nodules',
        question: 'Any nodules or masses?',
        options: ['No', 'Yes'],
        patterns: ['nodul', 'mass', 'lesion', 'metasta', 'spicul'],
        negative: 'No pulmonary nodule or mass is identified.',
        followUp: 'Size in millimetres, lobe, and margins?',
        why: 'Size and margins decide the follow-up interval.',
      },
      {
        id: 'pleura',
        question: 'Any pleural effusion or thickening?',
        options: ['No', 'Yes'],
        patterns: ['pleur', 'effusion', 'pneumothora', 'thicken'],
        negative: 'No pleural effusion or pneumothorax. Pleural surfaces are smooth.',
        followUp: 'Which side, and roughly what volume?',
        why: 'Commonly present and commonly omitted.',
      },
      {
        id: 'mediastinum',
        question: 'Mediastinum and hila normal?',
        options: ['Normal', 'Abnormal'],
        patterns: ['mediastin', 'hilar', 'hilum', 'lymph node', 'lymphadenopathy', 'aorta'],
        negative: 'Mediastinum is unremarkable. No enlarged mediastinal or hilar lymph nodes.',
        positiveAnswer: 'Abnormal',
        followUp: 'Which nodal stations, and short-axis size?',
        why: 'Nodal size drives staging.',
      },
      {
        id: 'airways',
        question: 'Trachea and major bronchi patent?',
        options: ['Patent', 'Abnormal'],
        patterns: ['trachea', 'bronch', 'airway'],
        negative: 'Trachea and major bronchi are patent.',
        positiveAnswer: 'Abnormal',
        followUp: 'Narrowing, obstruction, or wall thickening?',
        why: 'An obstructing lesion explains distal collapse.',
      },
      {
        id: 'bones',
        question: 'Bones and upper abdomen clear?',
        options: ['Clear', 'Abnormal'],
        patterns: ['bone', 'osseous', 'rib', 'vertebr', 'upper abdomen', 'liver', 'adrenal'],
        negative:
          'Visualised osseous structures are intact. Included sections of the upper abdomen appear normal.',
        positiveAnswer: 'Abnormal',
        followUp: 'What, and where?',
        why: 'Highest-yield source of missed incidental disease on chest CT.',
      },
    ],
  },

  {
    id: 'ct-abdomen-pelvis',
    specialty: 'radiology',
    name: 'CT Abdomen and Pelvis',
    hint: 'Solid organs, gut, urinary tract',
    contrastOptions: {
      'No contrast':
        '3 mm contiguous slices are taken from dome of diaphragm to iliac crests. No IV contrast is given.',
      'With contrast':
        '3 mm contiguous slices are taken from dome of diaphragm to symphysis pubis following IV contrast in the portal venous phase.',
    },
    order: ['solidOrgans', 'kidneys', 'urinary', 'gut', 'nodes', 'bones'],
    asks: [
      {
        id: 'solidOrgans',
        question: 'Liver, spleen, pancreas and adrenals normal?',
        options: ['Normal', 'Abnormal'],
        patterns: ['liver', 'hepat', 'spleen', 'splen', 'pancrea', 'gall bladder', 'gallbladder', 'adrenal'],
        negative:
          'Liver, gall bladder, pancreas, spleen and adrenals are normal morphologically. No mass is noted.',
        positiveAnswer: 'Abnormal',
        followUp: 'Which organ, and what is the finding?',
        why: 'The house reporting order starts here.',
      },
      {
        id: 'kidneys',
        question: 'Any renal calculus or mass?',
        options: ['No', 'Yes'],
        patterns: ['kidney', 'renal', 'calculus', 'calculi', 'stone', 'hydronephro', 'cyst'],
        negative:
          'Both kidneys are normal in size, shape and density. No solid or cystic mass is seen on either side.',
        followUp: 'Side, size in millimetres, and position?',
        why: 'The target organ for haematuria and colic studies.',
      },
      {
        id: 'urinary',
        question: 'Ureters and bladder normal?',
        options: ['Normal', 'Abnormal'],
        patterns: ['ureter', 'bladder', 'vesico', 'vuj'],
        negative:
          'Urinary bladder and lower ends of ureters are normal. Vesico-ureteric junctions are normal bilaterally.',
        positiveAnswer: 'Abnormal',
        followUp: 'Level of obstruction or calculus?',
        why: 'A VUJ calculus is the commonest cause of colic and the easiest level to skip.',
      },
      {
        id: 'gut',
        question: 'Bowel and stomach unremarkable?',
        options: ['Unremarkable', 'Abnormal'],
        patterns: ['bowel', 'gut', 'stomach', 'colon', 'appendix', 'obstruction', 'perforat', 'esophag', 'oesophag'],
        negative: 'Lower end of oesophagus, stomach and gut loops are unremarkable.',
        positiveAnswer: 'Abnormal',
        followUp: 'Which segment, and is there obstruction or perforation?',
        why: 'The main alternative explanation for abdominal pain.',
      },
      {
        id: 'nodes',
        question: 'Any lymphadenopathy or free fluid?',
        options: ['No', 'Yes'],
        patterns: ['lymphadenopathy', 'lymph node', 'para aortic', 'para-aortic', 'ascites', 'free fluid'],
        negative: 'No para-aortic or pelvic lymphadenopathy is noted. No ascites is seen.',
        followUp: 'Which station, or how much fluid?',
        why: 'Required before a study can be called normal.',
      },
      {
        id: 'bones',
        question: 'Bones and lung bases clear?',
        options: ['Clear', 'Abnormal'],
        patterns: ['bone', 'osseous', 'vertebr', 'pelvic bone', 'chest', 'lung base'],
        negative:
          'In-view pelvic muscles and bones are normal. No bone lesion is noted. Included sections of the chest appear normal.',
        positiveAnswer: 'Abnormal',
        followUp: 'What, and where?',
        why: 'The usual site of a missed incidental lesion.',
      },
    ],
  },

  {
    id: 'xray-chest',
    specialty: 'radiology',
    name: 'Chest X-ray',
    hint: 'PA or AP film',
    contrastOptions: {
      'PA erect': 'Frontal chest radiograph obtained in the postero-anterior erect projection.',
      'AP supine': 'Frontal chest radiograph obtained in the antero-posterior supine projection.',
    },
    order: ['lungs', 'heart', 'pleura', 'mediastinum', 'bones'],
    asks: [
      {
        id: 'lungs',
        question: 'Lung fields clear?',
        options: ['Clear', 'Abnormal'],
        patterns: ['consolidat', 'opacit', 'infiltrat', 'collapse', 'cavit', 'shadow', 'reticul'],
        negative: 'Both lung fields are clear. No consolidation or collapse.',
        positiveAnswer: 'Abnormal',
        followUp: 'Which zone, and what pattern?',
        why: 'The primary question on almost every chest film.',
      },
      {
        id: 'heart',
        question: 'Cardiac size normal?',
        options: ['Normal', 'Enlarged'],
        patterns: ['cardi', 'heart', 'ctr', 'cardiomegal'],
        negative: 'Cardiac size and configuration are within normal limits.',
        positiveAnswer: 'Enlarged',
        followUp: 'Cardiothoracic ratio, and which chambers?',
        why: 'A single measurement that changes the clinical picture.',
      },
      {
        id: 'pleura',
        question: 'Costophrenic angles clear?',
        options: ['Clear', 'Blunted'],
        patterns: ['costophrenic', 'pleur', 'effusion', 'pneumothora'],
        negative: 'Both costophrenic angles are clear. No pneumothorax.',
        positiveAnswer: 'Blunted',
        followUp: 'Which side, and how large?',
        why: 'Small effusions are the commonest miss on a plain film.',
      },
      {
        id: 'mediastinum',
        question: 'Mediastinum and hila normal?',
        options: ['Normal', 'Abnormal'],
        patterns: ['mediastin', 'hilar', 'hilum', 'trachea'],
        negative: 'Mediastinal contours are normal. Trachea is central. Hila are not enlarged.',
        positiveAnswer: 'Abnormal',
        followUp: 'Widening, shift, or hilar enlargement?',
        why: 'Mediastinal widening is a finding you cannot afford to miss.',
      },
      {
        id: 'bones',
        question: 'Bones and soft tissues normal?',
        options: ['Normal', 'Abnormal'],
        patterns: ['bone', 'rib', 'fracture', 'clavicle', 'soft tissue', 'surgical emphysema'],
        negative: 'Visualised bones and soft tissues are unremarkable.',
        positiveAnswer: 'Abnormal',
        followUp: 'Which bone, and what finding?',
        why: 'Rib fractures and lytic lesions hide in plain sight.',
      },
    ],
  },

  /* ----------------------------------------------------- histopathology -- */
  {
    id: 'histo-biopsy',
    specialty: 'histopathology',
    name: 'Biopsy (general)',
    hint: 'Endoscopic, core or punch biopsy',
    specimenQuestion: 'What specimen is this, and from where?',
    order: ['adequacy', 'malignancy', 'inflammation', 'dysplasia', 'granuloma', 'ihc'],
    asks: [
      {
        id: 'adequacy',
        question: 'Is the specimen adequate for assessment?',
        options: ['Adequate', 'Limited', 'Inadequate'],
        patterns: ['adequa', 'inadequa', 'insufficient', 'scant', 'crush artefact'],
        negative: 'The material submitted is adequate for assessment.',
        positiveAnswer: 'Limited',
        followUp: 'What limits it — superficial sampling, crush artefact, or scanty material?',
        why: 'An inadequate sample must never produce a confident negative.',
      },
      {
        id: 'malignancy',
        question: 'Any evidence of malignancy?',
        options: ['No', 'Yes'],
        patterns: ['malignan', 'carcinoma', 'adenocarcinom', 'lymphoma', 'sarcoma', 'tumour', 'tumor', 'neoplas'],
        negative: 'No evidence of malignancy is seen in the material examined.',
        followUp: 'What type, and what grade or differentiation?',
        why: 'The distinction the whole report turns on.',
      },
      {
        id: 'inflammation',
        question: 'Any significant inflammation?',
        options: ['No', 'Yes'],
        patterns: ['inflammat', 'infiltrate', 'neutrophil', 'lymphocyt', 'plasma cell', 'eosinophil', 'gastritis', 'colitis'],
        negative: 'No significant inflammatory infiltrate is identified.',
        followUp: 'Acute, chronic, or both — and how active?',
        why: 'Usually the answer to the clinical question in a non-neoplastic biopsy.',
      },
      {
        id: 'dysplasia',
        question: 'Any dysplasia?',
        options: ['No', 'Yes'],
        patterns: ['dysplas', 'atypia', 'intraepithelial neoplasia'],
        negative: 'No dysplasia is identified.',
        followUp: 'What grade — low or high?',
        why: 'Silence here is read as "not looked for".',
      },
      {
        id: 'granuloma',
        question: 'Any granulomas?',
        options: ['No', 'Yes'],
        patterns: ['granulom', 'caseat', 'giant cell', 'tuberculo'],
        negative: 'No granulomas are seen.',
        followUp: 'Caseating or non-caseating?',
        why: 'In this region tuberculosis is a live differential, and the distinction changes treatment entirely.',
      },
      {
        id: 'ihc',
        question: 'Are immunohistochemistry or special stains involved?',
        options: ['Not required', 'Pending', 'Completed'],
        patterns: ['immunohistochem', 'ihc', 'special stain', 'zn ', 'pas ', 'ck7', 'ck20'],
        negative: 'No ancillary studies were required.',
        positiveAnswer: 'Completed',
        followUp: 'Which stains, and what were the results?',
        why: 'A report issued as final while stains are outstanding is the failure this question prevents.',
      },
    ],
  },

  {
    id: 'histo-breast-core',
    specialty: 'histopathology',
    name: 'Breast core biopsy',
    hint: 'Image-guided, with receptor status',
    specimenQuestion: 'Which side, and what site — clock position and distance from nipple?',
    order: ['adequacy', 'invasion', 'grade', 'insitu', 'calcification', 'lvi', 'receptors'],
    asks: [
      {
        id: 'adequacy',
        question: 'Is the specimen adequate?',
        options: ['Adequate', 'Limited', 'Inadequate'],
        patterns: ['adequa', 'inadequa', 'scant'],
        negative: 'The cores submitted are adequate for assessment.',
        positiveAnswer: 'Limited',
        followUp: 'What limits it?',
        why: 'Gates how confidently a negative can be worded.',
      },
      {
        id: 'invasion',
        question: 'Is there invasive carcinoma?',
        options: ['No', 'Yes'],
        patterns: ['invasi', 'infiltrat', 'nst', 'no special type', 'lobular carcinoma'],
        negative: 'No evidence of invasive carcinoma in the material examined.',
        followUp: 'What type — no special type, lobular, or other?',
        why: 'Decides whether the patient enters a cancer pathway.',
      },
      {
        id: 'grade',
        question: 'What is the Nottingham grade?',
        options: ['Not applicable', 'Grade 1', 'Grade 2', 'Grade 3'],
        patterns: ['grade', 'nottingham', 'tubul', 'pleomorph', 'mitotic'],
        negative: 'Grading is not applicable to the material examined.',
        positiveAnswer: 'Grade 2',
        followUp: 'Tubule, pleomorphism and mitotic scores?',
        why: 'A bare grade number is not auditable. All three components must be scored.',
      },
      {
        id: 'insitu',
        question: 'Any in-situ component?',
        options: ['No', 'Yes'],
        patterns: ['in[- ]?situ', 'dcis', 'lcis'],
        negative: 'No in-situ carcinoma is identified.',
        followUp: 'DCIS or LCIS, and what nuclear grade?',
        why: 'Affects excision margins and planning.',
      },
      {
        id: 'calcification',
        question: 'Is calcification present in the cores?',
        options: ['No', 'Yes'],
        patterns: ['calcific'],
        negative: 'No calcification is identified within the cores examined.',
        followUp: 'Within the lesion, or in benign tissue?',
        why: 'If the biopsy targeted calcification, this is what proves the lesion was sampled.',
      },
      {
        id: 'lvi',
        question: 'Any lymphovascular invasion?',
        options: ['No', 'Yes'],
        patterns: ['lymphovascular', 'lvi', 'vascular invasion'],
        negative: 'No lymphovascular invasion is identified.',
        followUp: 'Focal or extensive?',
        why: 'Feeds staging and adjuvant therapy decisions.',
      },
      {
        id: 'receptors',
        question: 'Receptor status?',
        options: ['Not required', 'Pending', 'Available'],
        patterns: ['\\ber\\b', '\\bpr\\b', 'her2', 'ki-?67', 'allred', 'oestrogen', 'estrogen'],
        negative: 'Receptor studies were not required on this material.',
        positiveAnswer: 'Available',
        followUp: 'ER, PR, HER2 and Ki-67 results?',
        why: 'A HER2 2+ result is not an answer — it must be resolved by ISH or flagged pending.',
      },
    ],
  },
];

export const getStudy = (id) => studies.find((s) => s.id === id) || null;
export const studiesFor = (specialty) => studies.filter((s) => s.specialty === specialty);
