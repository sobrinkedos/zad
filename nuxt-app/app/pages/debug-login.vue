<template>
  <div style="padding: 2rem;">
    <h1>Debug Login</h1>
    <div>
      <label>Email: <input v-model="email" type="email" /></label>
    </div>
    <div>
      <label>Password: <input v-model="password" type="password" /></label>
    </div>
    <button @click="testLogin">Test Login</button>
    
    <div v-if="result" style="margin-top: 1rem; padding: 1rem; background: #f0f0f0;">
      <h3>Result:</h3>
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
const email = ref('riltons@gmail.com')
const password = ref('admin123456')
const result = ref<any>(null)

const client = useSupabaseClient()

async function testLogin() {
  result.value = 'Loading...'
  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })
    
    if (error) {
      result.value = {
        success: false,
        error: {
          message: error.message,
          status: error.status,
          name: error.name
        }
      }
    } else {
      result.value = {
        success: true,
        user: data.user
      }
    }
  } catch (e: any) {
    result.value = {
      success: false,
      exception: e.message
    }
  }
}
</script>
