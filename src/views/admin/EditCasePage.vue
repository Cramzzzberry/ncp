<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { toastStore } from '@/store'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

//introduction
const scenario = ref(null)
const imageLink = ref('')
const audioLink = ref('')

//assessment
const subjectives = ref({ texts: [{ text: '' }], correctValue: null })
const objectives = ref([{ text: '', isCorrect: false }])

//nursing diagnosis
const diagnosis = ref({
  texts: [
    {
      text: '',
      intervention: {
        independents: [{ text: null, rationale: null, isCorrect: false }],
        dependents: [{ text: null, rationale: null, isCorrect: false }],
        collaboratives: [{ text: null, rationale: null, isCorrect: false }]
      }
    }
  ],
  correctValue: null
})
const relatedTo = ref({ texts: [{ text: '' }], correctValue: null })
const signsAndSymptoms = ref([{ text: null, isCorrect: false }])

//planning
const shortTermGoalsDesc = ref(null)
const shortTermGoals = ref([{ text: null, isCorrect: false }])
const longTermGoalsDesc = ref(null)
const longTermGoals = ref([{ text: null, isCorrect: false }])

const isLoading = ref(false)
onMounted(async () => {
  if (route.name === 'admin edit case') {
    isLoading.value = true
    await axios({
      method: 'get',
      url: `${import.meta.env.VITE_API_DOMAIN}/case-scenarios/${route.params.category.split('/')[0]}/${route.params.id}`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('ncpadmin_token')}`,
        Role: 'admin'
      }
    })
      .then((res) => {
        scenario.value = res.data.scenario
        imageLink.value = res.data.image_link
        audioLink.value = res.data.audio_link

        subjectives.value = res.data.assessment.subjectives
        objectives.value = res.data.assessment.objectives

        diagnosis.value = res.data.nursing_diagnosis.diagnosis
        relatedTo.value = res.data.nursing_diagnosis.relatedTo
        signsAndSymptoms.value = res.data.nursing_diagnosis.signsAndSymptoms

        shortTermGoalsDesc.value = res.data.planning.shortTermGoalsDesc
        shortTermGoals.value = res.data.planning.shortTermGoals

        longTermGoalsDesc.value = res.data.planning.longTermGoalsDesc
        longTermGoals.value = res.data.planning.longTermGoals
      })
      .catch((err) => {
        if (err.response.status == 401) {
          router.push({ name: 'admin login' })
        } else {
          toastStore.add({
            msg: err.response.data,
            duration: 4000
          })
        }
      })
      .finally(() => (isLoading.value = false))
  }
})

watch(
  () => diagnosis.value.correctValue,
  () => {
    diagnosis.value.texts.forEach((item, index) => {
      if (item.text !== diagnosis.value.correctValue) {
        diagnosis.value.texts[index].intervention.independents.forEach((e, itemIndex) => {
          diagnosis.value.texts[index].intervention.independents[itemIndex].isCorrect = false
        })

        diagnosis.value.texts[index].intervention.dependents.forEach((e, itemIndex) => {
          diagnosis.value.texts[index].intervention.dependents[itemIndex].isCorrect = false
        })

        diagnosis.value.texts[index].intervention.collaboratives.forEach((e, itemIndex) => {
          diagnosis.value.texts[index].intervention.collaboratives[itemIndex].isCorrect = false
        })
      }
    })
  }
)

function addTextbox(section, diagnosisIndex = null) {
  if (section === 'subjective') {
    subjectives.value.texts.push({ text: '' })
  } else if (section === 'objective') {
    objectives.value.push({ isCorrect: false, text: '' })
  } else if (section === 'diagnosis') {
    diagnosis.value.texts.push({
      text: '',
      intervention: {
        independents: [{ text: null, rationale: null, isCorrect: false }],
        dependents: [{ text: null, rationale: null, isCorrect: false }],
        collaboratives: [{ text: null, rationale: null, isCorrect: false }]
      }
    })
  } else if (section === 'related to') {
    relatedTo.value.texts.push({ text: '' })
  } else if (section === 'signs and symptoms') {
    signsAndSymptoms.value.push({ isCorrect: false, text: '' })
  } else if (section === 'short term goal') {
    shortTermGoals.value.push({ isCorrect: false, text: '' })
  } else if (section === 'long term goal') {
    longTermGoals.value.push({ isCorrect: false, text: '' })
  } else if (section === 'independent') {
    diagnosis.value.texts[diagnosisIndex].intervention.independents.push({ isCorrect: false, text: '', rationale: '' })
  } else if (section === 'dependent') {
    diagnosis.value.texts[diagnosisIndex].intervention.dependents.push({ isCorrect: false, text: '', rationale: '' })
  } else if (section === 'collaborative') {
    diagnosis.value.texts[diagnosisIndex].intervention.collaboratives.push({ isCorrect: false, text: '', rationale: '' })
  }
}

function removeTextbox(index, section, interventionIndex = null) {
  if (section === 'subjective') {
    subjectives.value.texts.splice(index, 1)
  } else if (section === 'objective') {
    objectives.value.splice(index, 1)
  } else if (section === 'diagnosis') {
    diagnosis.value.texts.splice(index, 1)
  } else if (section === 'related to') {
    relatedTo.value.texts.splice(index, 1)
  } else if (section === 'signs and symptoms') {
    signsAndSymptoms.value.splice(index, 1)
  } else if (section === 'short term goal') {
    shortTermGoals.value.splice(index, 1)
  } else if (section === 'long term goal') {
    longTermGoals.value.splice(index, 1)
  } else if (section === 'independent') {
    diagnosis.value.texts[index].intervention.independents.splice(interventionIndex, 1)
  } else if (section === 'dependent') {
    diagnosis.value.texts[index].intervention.dependents.splice(interventionIndex, 1)
  } else if (section === 'collaborative') {
    diagnosis.value.texts[index].intervention.collaboratives.splice(interventionIndex, 1)
  }
}

const isCreating = ref(false)
async function create() {
  isCreating.value = true
  await axios({
    method: 'post',
    url: `${import.meta.env.VITE_API_DOMAIN}/case-scenarios`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('ncpadmin_token')}`,
      Role: 'admin'
    },
    data: {
      category: route.params.category.split('/')[0],
      scenario: scenario.value,
      image_link: imageLink.value,
      audio_link: audioLink.value,
      assessment: {
        subjectives: subjectives.value,
        objectives: objectives.value
      },
      nursing_diagnosis: {
        diagnosis: diagnosis.value,
        relatedTo: relatedTo.value,
        signsAndSymptoms: signsAndSymptoms.value
      },
      planning: {
        shortTermGoalsDesc: shortTermGoalsDesc.value,
        shortTermGoals: shortTermGoals.value,
        longTermGoalsDesc: longTermGoalsDesc.value,
        longTermGoals: longTermGoals.value
      }
    }
  })
    .then(() => {
      router.push({ name: 'admin case scenarios', params: { category: route.params.category } })
      toastStore.add({
        msg: 'Case created',
        duration: 4000
      })
    })
    .catch((err) => {
      if (err.response.status == 401) {
        router.push({ name: 'admin login' })
      } else {
        toastStore.add({
          msg: err.response.data,
          duration: 4000
        })
      }
    })
    .finally(() => (isCreating.value = false))
}

const isSaving = ref(false)
async function save() {
  isSaving.value = true
  await axios({
    method: 'put',
    url: `${import.meta.env.VITE_API_DOMAIN}/case-scenarios/${route.params.category}/${route.params.id}`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('ncpadmin_token')}`,
      Role: 'admin'
    },
    data: {
      category: route.params.category,
      scenario: scenario.value,
      image_link: imageLink.value,
      audio_link: audioLink.value,
      assessment: {
        subjectives: subjectives.value,
        objectives: objectives.value
      },
      nursing_diagnosis: {
        diagnosis: diagnosis.value,
        relatedTo: relatedTo.value,
        signsAndSymptoms: signsAndSymptoms.value
      },
      planning: {
        shortTermGoalsDesc: shortTermGoalsDesc.value,
        shortTermGoals: shortTermGoals.value,
        longTermGoalsDesc: longTermGoalsDesc.value,
        longTermGoals: longTermGoals.value
      }
    }
  })
    .then(() => {
      toastStore.add({
        msg: 'Case updated',
        duration: 4000
      })
    })
    .catch((err) => {
      if (err.response.status == 401) {
        router.push({ name: 'admin login' })
      } else {
        toastStore.add({
          msg: err.response.data,
          duration: 4000
        })
      }
    })
    .finally(() => (isSaving.value = false))
}

async function copyToClipboard(str) {
  await navigator.clipboard.writeText(str).then(() => {
    toastStore.add({
      msg: 'ID copied',
      duration: 1000
    })
  })
}
</script>

<template>
  <VIconButton
    @click="$router.replace({ name: 'admin case scenarios' })"
    icon="arrow_back"
    variant="ghost"
    size="lg"
    class="!sticky left-52 top-[100px] w-fit"
  />
  <div class="w-full pt-4 text-center">
    <h1>{{ $route.params.category.charAt(0).toUpperCase() + $route.params.category.slice(1) }} - Case Scenario {{ $route.params.number }}</h1>

    <div v-if="$route.name === 'admin edit case'" class="flex flex-row items-center justify-center gap-2">
      <span>ID: {{ $route.params.id }}</span>

      <VIconButton @click="copyToClipboard($route.params.id)" icon="content_copy" variant="ghost" class="relative z-[11]" />
    </div>
  </div>

  <div v-if="isLoading" class="flex items-center justify-center py-4">
    <VLoader size="32px" thickness="2px" />
  </div>

  <form
    @submit.prevent="$route.name === 'admin create case' ? create() : $route.name === 'admin edit case' ? save() : null"
    v-else
    class="flex w-full flex-col gap-6 px-64 pb-32"
  >
    <!-- Scenario -->
    <div>
      <h2 class="sticky top-[61px] z-10 bg-blue-50 pt-4">Scenario Section</h2>
      <hr class="m-2 border-neutral-300" />
      <VFormTextbox v-model="scenario" label="Scenario *" placeholder="Put any scenario description here" textarea required />
      <VFormTextbox v-model="imageLink" label="Image Preview Link" placeholder="URL" />
      <VFormTextbox v-model="audioLink" label="Audio Sample Link" placeholder="URL" />
    </div>

    <!-- Assessment -->
    <div>
      <h2 class="sticky top-[61px] z-10 bg-blue-50 pt-4">Assessment Section</h2>
      <hr class="m-2 border-neutral-300" />
      <div class="flex flex-col items-center gap-1">
        <div class="flex w-full flex-row items-center place-self-start text-sm lg:text-base">
          <span class="grow">Subjectives *</span>
          <span class="text-neutral-600">Correct</span>
          <span class="basis-[36px]"></span>
        </div>

        <div class="flex w-full flex-col items-center gap-2">
          <div v-for="(choice, index) in subjectives.texts" :key="index" class="flex w-full flex-row items-center gap-2">
            <VTextbox v-model="choice.text" type="text" class="w-full" :placeholder="'Subjective ' + (index + 1)" required />

            <label class="flex h-fit w-fit cursor-pointer items-center justify-center rounded-full p-4 hover:bg-neutral-400/20">
              <input v-model="subjectives.correctValue" :value="choice.text" name="subjective" type="radio" class="cursor-pointer" />
            </label>

            <VIconButton
              @click.prevent="removeTextbox(index, 'subjective')"
              :disabled="subjectives.texts.length <= 1"
              variant="ghost"
              color="error"
              size="lg"
              icon="close"
            />
          </div>

          <VIconButton @click.prevent="addTextbox('subjective')" variant="ghost" icon="add" size="lg" />
        </div>
      </div>

      <hr class="m-2 border-neutral-300" />
      <div class="flex flex-col items-center gap-1">
        <div class="flex w-full flex-row items-center place-self-start text-sm lg:text-base">
          <span class="grow">Objectives *</span>
          <span class="text-neutral-600">Correct</span>
          <span class="basis-[36px]"></span>
        </div>

        <div class="flex w-full flex-col items-center gap-2">
          <div v-for="(choice, index) in objectives" :key="index" class="flex w-full flex-row items-center gap-2">
            <VTextbox v-model="choice.text" type="text" class="w-full" :placeholder="'Objective ' + (index + 1)" required />

            <label class="flex cursor-pointer items-center justify-center rounded-full p-4 hover:bg-neutral-400/20">
              <input v-model="choice.isCorrect" :value="choice.isCorrect" type="checkbox" name="subjective" class="cursor-pointer" />
            </label>

            <VIconButton
              @click.prevent="removeTextbox(index, 'objective')"
              :disabled="objectives.length <= 1"
              variant="ghost"
              color="error"
              size="lg"
              icon="close"
            />
          </div>

          <VIconButton @click.prevent="addTextbox('objective')" variant="ghost" icon="add" size="lg" />
        </div>
      </div>
    </div>

    <!-- Nursing Diagnosis -->
    <div>
      <h2 class="sticky top-[61px] z-10 bg-blue-50 pt-4">Nursing Diagnosis Section</h2>
      <hr class="m-2 border-neutral-300" />
      <div class="flex flex-col items-center gap-1">
        <div class="flex w-full flex-row items-center place-self-start text-sm lg:text-base">
          <span class="grow">Diagnoses *</span>
          <span class="text-neutral-600">Correct</span>
          <span class="basis-[36px]"></span>
        </div>

        <div class="flex w-full flex-col items-center gap-2">
          <div v-for="(choice, index) in diagnosis.texts" :key="index" class="flex w-full flex-col items-center gap-2">
            <div class="flex w-full flex-row items-center gap-2">
              <VTextbox v-model="choice.text" type="text" class="w-full" :placeholder="'Diagnoses ' + (index + 1)" required />

              <label class="flex h-fit w-fit cursor-pointer items-center justify-center rounded-full p-4 hover:bg-neutral-400/20">
                <input v-model="diagnosis.correctValue" :value="choice.text" name="diagnosis" type="radio" class="cursor-pointer" />
              </label>

              <VIconButton
                @click.prevent="removeTextbox(index, 'diagnosis')"
                :disabled="diagnosis.texts.length <= 1"
                variant="ghost"
                color="error"
                size="lg"
                icon="close"
              />
            </div>

            <details class="mb-4 w-full rounded-3xl border border-gray-300 px-4 py-2">
              <summary class="w-full cursor-pointer select-none">Intervention and Rationale {{ index + 1 }}</summary>
              <div class="flex flex-col items-center gap-1">
                <div class="flex w-full flex-row items-center place-self-start text-sm lg:text-base">
                  <span class="grow">Independents *</span>
                  <span class="text-neutral-600">Correct</span>
                  <span class="basis-[36px]"></span>
                </div>
                <div class="flex w-full flex-col items-center gap-4">
                  <div v-for="(item, itemIndex) in choice.intervention.independents" :key="itemIndex" class="flex w-full flex-row items-center gap-2">
                    <div class="flex w-full flex-col gap-2">
                      <VTextbox v-model="item.text" type="text" class="w-full" :placeholder="'Independent ' + (itemIndex + 1)" required />
                      <div class="flex flex-row items-center gap-2">
                        <i>Rationale:</i>
                        <VTextbox
                          v-model="item.rationale"
                          type="text"
                          class="w-full font-normal italic"
                          :placeholder="'Rationale ' + (itemIndex + 1)"
                          required
                        />
                      </div>
                    </div>
                    <label
                      class="flex cursor-pointer items-center justify-center rounded-full p-4 hover:bg-neutral-400/20 has-[:disabled]:cursor-not-allowed has-[:disabled]:bg-transparent"
                    >
                      <input
                        v-model="item.isCorrect"
                        :value="item.isCorrect"
                        :disabled="choice.text !== diagnosis.correctValue"
                        type="checkbox"
                        name="independents"
                        class="cursor-pointer disabled:cursor-not-allowed"
                      />
                    </label>
                    <VIconButton
                      @click.prevent="removeTextbox(index, 'independent', itemIndex)"
                      :disabled="choice.intervention.independents.length <= 1"
                      variant="ghost"
                      color="error"
                      size="lg"
                      icon="close"
                    />
                  </div>
                </div>
                <VIconButton @click.prevent="addTextbox('independent', index)" variant="ghost" icon="add" size="lg" />
              </div>

              <hr class="m-2 border-neutral-300" />
              <div class="flex flex-col items-center gap-1">
                <div class="flex w-full flex-row items-center place-self-start text-sm lg:text-base">
                  <span class="grow">Dependents *</span>
                  <span class="text-neutral-600">Correct</span>
                  <span class="basis-[36px]"></span>
                </div>
                <div class="flex w-full flex-col items-center gap-4">
                  <div v-for="(item, itemIndex) in choice.intervention.dependents" :key="itemIndex" class="flex w-full flex-row items-center gap-2">
                    <div class="flex w-full flex-col gap-2">
                      <VTextbox v-model="item.text" type="text" class="w-full" :placeholder="'Dependent ' + (itemIndex + 1)" required />
                      <div class="flex flex-row items-center gap-2">
                        <i>Rationale:</i>
                        <VTextbox
                          v-model="item.rationale"
                          type="text"
                          class="w-full font-normal italic"
                          :placeholder="'Rationale ' + (itemIndex + 1)"
                          required
                        />
                      </div>
                    </div>
                    <label
                      class="flex cursor-pointer items-center justify-center rounded-full p-4 hover:bg-neutral-400/20 has-[:disabled]:cursor-not-allowed has-[:disabled]:bg-transparent"
                    >
                      <input
                        v-model="item.isCorrect"
                        :value="item.isCorrect"
                        :disabled="choice.text !== diagnosis.correctValue"
                        type="checkbox"
                        name="dependents"
                        class="cursor-pointer disabled:cursor-not-allowed"
                      />
                    </label>
                    <VIconButton
                      @click.prevent="removeTextbox(index, 'dependent', itemIndex)"
                      :disabled="choice.intervention.dependents.length <= 1"
                      variant="ghost"
                      color="error"
                      size="lg"
                      icon="close"
                    />
                  </div>
                </div>
                <VIconButton @click.prevent="addTextbox('dependent', index)" variant="ghost" icon="add" size="lg" />
              </div>

              <hr class="m-2 border-neutral-300" />
              <div class="flex flex-col items-center gap-1">
                <div class="flex w-full flex-row items-center place-self-start text-sm lg:text-base">
                  <span class="grow">Collaboratives *</span>
                  <span class="text-neutral-600">Correct</span>
                  <span class="basis-[36px]"></span>
                </div>
                <div class="flex w-full flex-col items-center gap-4">
                  <div v-for="(item, itemIndex) in choice.intervention.collaboratives" :key="itemIndex" class="flex w-full flex-row items-center gap-2">
                    <div class="flex w-full flex-col gap-2">
                      <VTextbox v-model="item.text" type="text" class="w-full" :placeholder="'Collaborative ' + (itemIndex + 1)" required />
                      <div class="flex flex-row items-center gap-2">
                        <i>Rationale:</i>
                        <VTextbox
                          v-model="item.rationale"
                          type="text"
                          class="w-full font-normal italic"
                          :placeholder="'Rationale ' + (itemIndex + 1)"
                          required
                        />
                      </div>
                    </div>
                    <label
                      class="flex cursor-pointer items-center justify-center rounded-full p-4 hover:bg-neutral-400/20 has-[:disabled]:cursor-not-allowed has-[:disabled]:bg-transparent"
                    >
                      <input
                        v-model="item.isCorrect"
                        :value="item.isCorrect"
                        :disabled="choice.text !== diagnosis.correctValue"
                        type="checkbox"
                        name="collaborative"
                        class="cursor-pointer disabled:cursor-not-allowed"
                      />
                    </label>
                    <VIconButton
                      @click.prevent="removeTextbox(index, 'collaborative', itemIndex)"
                      :disabled="choice.intervention.collaboratives.length <= 1"
                      variant="ghost"
                      color="error"
                      size="lg"
                      icon="close"
                    />
                  </div>
                </div>
                <VIconButton @click.prevent="addTextbox('collaborative', index)" variant="ghost" icon="add" size="lg" />
              </div>
            </details>
          </div>
          <VIconButton @click.prevent="addTextbox('diagnosis')" variant="ghost" icon="add" size="lg" />
        </div>
      </div>

      <hr class="m-2 border-neutral-300" />
      <div class="flex flex-col items-center gap-1">
        <div class="flex w-full flex-row items-center place-self-start text-sm lg:text-base">
          <span class="grow">Related To *</span>
          <span class="text-neutral-600">Correct</span>
          <span class="basis-[36px]"></span>
        </div>

        <div class="flex w-full flex-col items-center gap-2">
          <div v-for="(choice, index) in relatedTo.texts" :key="index" class="flex w-full flex-row items-center gap-2">
            <VTextbox v-model="choice.text" type="text" class="w-full" :placeholder="'Related to ' + (index + 1)" required />

            <label class="flex h-fit w-fit cursor-pointer items-center justify-center rounded-full p-4 hover:bg-neutral-400/20">
              <input v-model="relatedTo.correctValue" :value="choice.text" name="related_to" type="radio" class="cursor-pointer" />
            </label>

            <VIconButton
              @click.prevent="removeTextbox(index, 'related to')"
              :disabled="relatedTo.texts.length <= 1"
              variant="ghost"
              color="error"
              size="lg"
              icon="close"
            />
          </div>

          <VIconButton @click.prevent="addTextbox('related to')" variant="ghost" icon="add" size="lg" />
        </div>
      </div>

      <hr class="m-2 border-neutral-300" />
      <div class="flex flex-col items-center gap-1">
        <div class="flex w-full flex-row items-center place-self-start text-sm lg:text-base">
          <span class="grow">Signs and Symptoms *</span>
          <span class="text-neutral-600">Correct</span>
          <span class="basis-[36px]"></span>
        </div>

        <div class="flex w-full flex-col items-center gap-2">
          <div v-for="(choice, index) in signsAndSymptoms" :key="index" class="flex w-full flex-row items-center gap-2">
            <VTextbox v-model="choice.text" type="text" class="w-full" :placeholder="'Signs and symptoms ' + (index + 1)" required />

            <label class="flex cursor-pointer items-center justify-center rounded-full p-4 hover:bg-neutral-400/20">
              <input v-model="choice.isCorrect" :value="choice.isCorrect" type="checkbox" name="signs_and_symptoms" class="cursor-pointer" />
            </label>

            <VIconButton
              @click.prevent="removeTextbox(index, 'signs and symptoms')"
              :disabled="signsAndSymptoms.length <= 1"
              variant="ghost"
              color="error"
              size="lg"
              icon="close"
            />
          </div>

          <VIconButton @click.prevent="addTextbox('signs and symptoms')" variant="ghost" icon="add" size="lg" />
        </div>
      </div>
    </div>

    <!-- Planning -->
    <div>
      <h2 class="sticky top-[61px] z-10 bg-blue-50 pt-4">Planning Section</h2>
      <hr class="m-2 border-neutral-300" />
      <div class="flex flex-col items-center gap-1">
        <VFormTextbox
          v-model="shortTermGoalsDesc"
          label="Short Term Goal Description *"
          type="text"
          class="w-full"
          placeholder="Ex. Within 3 days of nursing interventions, the client will be able to:"
          required
        />

        <div class="flex w-full flex-row items-center place-self-start text-sm lg:text-base">
          <span class="grow">Short Term Goals *</span>
          <span class="text-neutral-600">Correct</span>
          <span class="basis-[36px]"></span>
        </div>

        <div class="flex w-full flex-col items-center gap-2">
          <div v-for="(choice, index) in shortTermGoals" :key="index" class="flex w-full flex-row items-center gap-2">
            <VTextbox v-model="choice.text" type="text" class="w-full" :placeholder="'Short term goal ' + (index + 1)" required />

            <label class="flex cursor-pointer items-center justify-center rounded-full p-4 hover:bg-neutral-400/20">
              <input v-model="choice.isCorrect" :value="choice.isCorrect" type="checkbox" name="short_term_goals" class="cursor-pointer" />
            </label>

            <VIconButton
              @click.prevent="removeTextbox(index, 'short term goal')"
              :disabled="shortTermGoals.length <= 1"
              variant="ghost"
              color="error"
              size="lg"
              icon="close"
            />
          </div>

          <VIconButton @click.prevent="addTextbox('short term goal')" variant="ghost" icon="add" size="lg" />
        </div>
      </div>

      <hr class="m-2 border-neutral-300" />
      <div class="flex flex-col items-center gap-1">
        <VFormTextbox
          v-model="longTermGoalsDesc"
          label="Long Term Goal Description *"
          type="text"
          class="w-full"
          placeholder="Ex. Within 1 week of nursing interventions, the client will be able to:"
          required
        />

        <div class="flex w-full flex-row items-center place-self-start text-sm lg:text-base">
          <span class="grow">Long Term Goals *</span>
          <span class="text-neutral-600">Correct</span>
          <span class="basis-[36px]"></span>
        </div>

        <div v-for="(choice, index) in longTermGoals" :key="index" class="flex w-full flex-row items-center gap-2">
          <VTextbox v-model="choice.text" type="text" class="w-full" :placeholder="'Long term goal ' + (index + 1)" required />

          <label class="flex cursor-pointer items-center justify-center rounded-full p-4 hover:bg-neutral-400/20">
            <input v-model="choice.isCorrect" :value="choice.isCorrect" type="checkbox" name="long_term_goals" class="cursor-pointer" />
          </label>

          <VIconButton
            @click.prevent="removeTextbox(index, 'long term goal')"
            :disabled="longTermGoals.length <= 1"
            variant="ghost"
            color="error"
            size="lg"
            icon="close"
          />
        </div>

        <VIconButton @click.prevent="addTextbox('long term goal')" variant="ghost" icon="add" size="lg" />
      </div>
    </div>

    <VButton
      v-if="$route.name === 'admin create case'"
      :disabled="isCreating"
      size="lg"
      type="submit"
      class="fixed bottom-10 right-16 w-[140px] justify-center"
    >
      <VLoader v-if="isCreating" size="20px" thickness="2px" />
      <template v-else>
        <span class="material-icons"> add </span>
        Create
      </template>
    </VButton>

    <VButton
      v-else-if="$route.name === 'admin edit case'"
      :disabled="isSaving"
      size="lg"
      type="submit"
      class="fixed bottom-10 right-16 w-[124px] justify-center"
    >
      <VLoader v-if="isSaving" size="20px" thickness="2px" />
      <template v-else>
        <span class="material-icons"> save </span>
        Save
      </template>
    </VButton>
  </form>
</template>

<style scoped></style>
