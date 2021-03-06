import React, { useContext, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import AppContext from './AppContext'
import Seo from './Seo'
import Container from './Container'
import Form from './form/Form'
import Button from './Button'
import userService from '../services/user'
import storageAvailable from '../utils/storageAvailable'
import { navigate } from 'gatsby'

const Verify = () => {
  const { user, setUser, setNotification } = useContext(AppContext)
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      nick: null,
      code: null
    }
  })

  const onSubmit = async data => {
    const userObject = { nick: data.nick, code: data.code }
    try {
      const response = await userService.verify(userObject)
      const verifiedUser = { ...user, verified: true }
      setUser(verifiedUser)
      if (storageAvailable('localStorage')) {
        localStorage.setItem('storedUser', JSON.stringify(verifiedUser))
      }
      setNotification({ message: 'Verificación correcta 🎉', error: false })
      navigate('/app/perfil')
      setTimeout(() => setNotification({ message: '', error: false }), 2000)
    } catch (e) {
      if (e.response) {
        switch (e.response.status) {
          case 400:
            setNotification({ message: 'Error: código inválido/faltante.', error: true })
            break
          case 500:
            setNotification({ message: 'Error: error interno del servidor.', error: true })
            break
          default:
            setNotification({ message: 'Error desconocido.', error: true })
        }
      } else if (e.request) {
        setNotification({ message: 'Error: el sistema está caído.', error: true })
      } else {
        setNotification({ message: 'Error desconocido.', error: true })
      }
      setTimeout(() => setNotification({ message: '', error: false }), 3000)
    }
  }

  useEffect(() => {
    if (userService.isVerified()) {
      navigate('/')
    }
    setValue('nick', user.nick)
  }, [])

  return (
    <>
      <Seo
        title='Verifica tu cuenta'
        description='Para continuar, debes introducir el código que llegó a tu correo.'
      />
      <section>
        <Container className='thin'>
          <h1>Verifica tu cuenta</h1>
          <p>Para continuar, ingresa el código de verificación que llegó a tu correo.</p>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <input type='hidden' {...register('nick')} />
            <label htmlFor='code'>Código de verificación:</label>
            <input type='text' {...register('code', { required: true })} />
            <Button type='submit' primary>Verificar cuenta</Button>
          </Form>
        </Container>
      </section>
    </>
  )
}

export default Verify
