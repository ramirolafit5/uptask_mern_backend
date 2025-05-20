/* import request from 'supertest';
import User from '../../models/User';
import Token from '../../models/Token';
import app from '../../server';
import { clearDB, closeDB, connectDB } from '../../utils/test/dbHandler';
import * as token from '../../utils/token';
import { AuthEmail } from '../../emails/AuthEmail';
import * as auth from '../../utils/auth';
import * as jwt from '../../utils/jwt';

jest.mock('nodemailer', () => {
  return {
    createTransport: jest.fn().mockReturnValue({
      sendMail: jest.fn().mockResolvedValue({}),
    }),
  };
});

beforeAll(async () => {
  await connectDB();
});

afterEach(async () => {
  jest.restoreAllMocks();
  await clearDB();
});

afterAll(async () => {
  await closeDB();
});

describe('POST /api/auth/create-account', () => {
  it('debería crear una cuenta nueva y devolver un mensaje de éxito', async () => {
    const res = await request(app)
      .post('/api/auth/create-account')
      .send({
        name: 'admin2',
        email: 'admin2@admin.com',
        password: '12345678',
        password_confirmation: '12345678',
      });

    expect(res.status).toBe(200);
    expect(res.text).toBe('Cuenta creada, revisa tu email para confirmarla');
  });
});

describe('POST /api/auth/confirm-account', () => {
  it('debería confirmar la cuenta cuando el token es válido', async () => {
    // Crear un usuario de prueba
    const user = new User({
      name: 'admin',
      email: 'admin@admin.com',
      password: '12345678',
      confirmed: false,
    });
    await user.save();

    // Crear un token de prueba para el usuario
    const token = new Token({
      token: '970021', // Este token es el que usarás para la solicitud
      user: user._id,
    });
    await token.save();

    // Enviar la solicitud con el token de confirmación
    const res = await request(app)
      .post('/api/auth/confirm-account')
      .send({ token: '970021' });

    // Verificar que la respuesta sea correcta
    expect(res.status).toBe(200);
    expect(res.text).toBe('Perfil actualizado correctamente');

    // Verificar que el usuario ha sido confirmado en la base de datos
    const updatedUser = await User.findById(user._id);
    expect(updatedUser?.confirmed).toBe(true);

    // Verificar que el token haya sido eliminado
    const tokenInDb = await Token.findOne({ token: '970021' });
    expect(tokenInDb).toBeNull();
  });

  it('debería devolver un error si el token no es válido', async () => {
    // Enviar una solicitud con un token inválido
    const res = await request(app)
      .post('/api/auth/confirm-account')
      .send({ token: 'invalidToken' });

    // Verificar que la respuesta sea un error
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Token no valido');
  });
});

describe('POST /api/auth/forgot-password', () => {

  afterEach(() => {
    jest.restoreAllMocks(); // Limpia todos los mocks después de cada test
  });

  it('should generate a token and send an email to the user', async () => {
    // Crear un usuario de prueba
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed-password',
      confirmed: true,
    });
    await user.save();

    const generateTokenMock = jest
      .spyOn(token, 'generateToken')
      .mockReturnValue('test-token');

    const sendPasswordResetTokenMock = jest
      .spyOn(AuthEmail, 'sendPasswordResetToken')
      .mockResolvedValue(undefined);

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(200);
    expect(res.text).toBe('Revisa tu email y sigue los pasos');
    expect(generateTokenMock).toHaveBeenCalled();
    expect(sendPasswordResetTokenMock).toHaveBeenCalledWith({
      email: user.email,
      name: user.name,
      token: 'test-token',
    });

    const tokenInDb = await Token.findOne({ user: user._id });
    expect(tokenInDb).not.toBeNull();
    expect(tokenInDb?.token).toBe('test-token');
  });

  it('should return 404 if the user does not exist', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nonexistent@example.com' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('El usuario no esta registrado');
  });

  it('should return 500 if there is an error', async () => {
    jest.spyOn(User, 'findOne').mockRejectedValue(new Error('Simulated error'));

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Hubo un error');
  });
});

describe('POST /api/auth/validate-token', () => {
  it('should return 200 if the token is valid', async () => {
    // Crear un usuario y un token de prueba
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed-password',
      confirmed: true,
    });
    await user.save();

    const tokenValue = 'valid-test-token';
    const token = new Token({
      token: tokenValue,
      user: user._id,
    });
    await token.save();

    // Enviar la solicitud para validar el token
    const res = await request(app)
      .post('/api/auth/validate-token')
      .send({ token: tokenValue });

    // Verificar que la respuesta sea correcta
    expect(res.status).toBe(200);
    expect(res.text).toBe('Token valido, define tu nueva clave');
  });

  it('should return 404 if the token is invalid', async () => {
    // Enviar la solicitud para validar un token inexistente
    const res = await request(app)
      .post('/api/auth/validate-token')
      .send({ token: 'invalid-token' });

    // Verificar que la respuesta sea un error 404
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Token no valido');
  });

  it('should return 500 if there is an error', async () => {
    // Mock de Token.findOne para que simule un error
    jest.spyOn(Token, 'findOne').mockRejectedValue(new Error('Simulated error'));

    // Enviar la solicitud para validar el token
    const res = await request(app)
      .post('/api/auth/validate-token')
      .send({ token: 'any-token' });

    // Verificar que la respuesta sea un error 500
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Hubo un error');
  });
});

describe('POST /api/auth/login', () => {
  it('debería iniciar sesión correctamente y devolver un JWT con credenciales válidas y cuenta confirmada', async () => {
    // Crear un usuario de prueba con cuenta confirmada
    const hashedPassword = await auth.hashPassword('12345678');
    const user = new User({ email: 'test@example.com', password: hashedPassword, confirmed: true });
    await user.save();

    // Mock de generateJWT
    const generateJWTMock = jest.spyOn(jwt, 'generateJWT').mockReturnValue('test-jwt');

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: '12345678' });

    expect(res.status).toBe(200);
    expect(res.text).toBe('test-jwt');
    expect(generateJWTMock).toHaveBeenCalledWith({ id: user._id.toString() });
  });
  
  it('debería devolver un error 404 si el usuario no existe', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'anypassword' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Usuario no encontrado');
  });

  it('debería devolver un error 401 y enviar un email si la cuenta no está confirmada', async () => {
    // Crear un usuario de prueba sin confirmar
    const hashedPassword = await auth.hashPassword('12345678');
    const user = new User({ email: 'unconfirmed@example.com', password: hashedPassword, confirmed: false });
    await user.save();

    // Mock de generateToken y sendConfirmationEmail
    const generateTokenMock = jest.spyOn(token, 'generateToken').mockReturnValue('test-confirmation-token');
    const sendConfirmationEmailMock = jest.spyOn(AuthEmail, 'sendConfirmationEmail').mockResolvedValue(undefined);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'unconfirmed@example.com', password: '12345678' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('La cuenta no ha sido confirmada, hemos enviado un email de confirmacion');
    expect(generateTokenMock).toHaveBeenCalled();
    expect(sendConfirmationEmailMock).toHaveBeenCalledWith(expect.objectContaining({
      email: user.email,
      name: user.name,
      token: 'test-confirmation-token',
    }));

    // Verificar que se guardó el token
    const tokenInDb = await Token.findOne({ user: user._id });
    expect(tokenInDb).not.toBeNull();
    generateTokenMock.mockRestore();
    sendConfirmationEmailMock.mockRestore();
  });


  it('debería devolver un error 401 si la contraseña es incorrecta', async () => {
    // Crear un usuario de prueba con cuenta confirmada
    const hashedPassword = await auth.hashPassword('correctpassword');
    const user = new User({ email: 'wrongpassword@example.com', password: hashedPassword, confirmed: true });
    await user.save();

    // Mock de checkPassword para simular una contraseña incorrecta
    const checkPasswordMock = jest.spyOn(auth, 'checkPassword').mockResolvedValue(false);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrongpassword@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Contraseña incorrecta');
    expect(checkPasswordMock).toHaveBeenCalledWith('wrongpassword', hashedPassword);
  });

  it('should return 500 if there is an error', async () => {
    const mock = jest.spyOn(Token, 'findOne').mockRejectedValue(new Error('Simulated error'));

    const res = await request(app)
      .post('/api/auth/validate-token')
      .send({ token: 'token-error' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Hubo un error');
  });
});

describe('POST /api/auth/request-code', () => {
  afterEach(() => {
    jest.restoreAllMocks(); // limpia los mocks entre tests
  });

  it('debe devolver 404 si el usuario no existe', async () => {
    const res = await request(app)
      .post('/api/auth/request-code')
      .send({ email: 'nonexistent@example.com' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('El usuario no esta registrado');
  });

  it('debe devolver 403 si el usuario ya está confirmado', async () => {
    const user = new User({
      email: 'confirmed@example.com',
      name: 'Confirmed User',
      confirmed: true,
      password: 'hashedpassword',
    });
    await user.save();

    const res = await request(app)
      .post('/api/auth/request-code')
      .send({ email: 'confirmed@example.com' });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('El usuario ya esta confirmado');
  });

  it('debe enviar un token y responder exitosamente', async () => {
    // Usuario no confirmado
    const user = new User({
      email: 'unconfirmed@example.com',
      name: 'Unconfirmed User',
      confirmed: false,
      password: 'hashedpassword',
    });
    await user.save();

    // Mock de generateToken para que devuelva un token fijo
    const generateTokenMock = jest.spyOn(require('../../utils/token'), 'generateToken').mockReturnValue('test-token');

    // Mock del método para enviar email
    const sendConfirmationEmailMock = jest.spyOn(require('../../emails/AuthEmail').AuthEmail, 'sendConfirmationEmail').mockResolvedValue(undefined);

    const res = await request(app)
      .post('/api/auth/request-code')
      .send({ email: 'unconfirmed@example.com' });

    expect(res.status).toBe(200);
    expect(res.text).toBe('Se envió un nuevo token a tu email');

    expect(generateTokenMock).toHaveBeenCalled();

    expect(sendConfirmationEmailMock).toHaveBeenCalledWith(expect.objectContaining({
      email: user.email,
      name: user.name,
      token: 'test-token',
    }));

    // Verificar que el token se guardó en la BD
    const tokenInDb = await Token.findOne({ user: user._id });
    expect(tokenInDb).not.toBeNull();
    expect(tokenInDb?.token).toBe('test-token');
  });

  it('debe devolver 500 si hay un error inesperado', async () => {
    // Simular error en User.findOne
    jest.spyOn(User, 'findOne').mockRejectedValue(new Error('Simulated error'));

    const res = await request(app)
      .post('/api/auth/request-code')
      .send({ email: 'any@example.com' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Hubo un error');
  });
});

describe('GET /api/auth/user', () => {
  let user: any;
  let token: string;

  beforeAll(async () => {
    user = new User({
      name: 'Auth User',
      email: 'auth@example.com',
      password: 'hashed-password',
      confirmed: true,
    });
    await user.save();

    token = jwt.generateJWT({ id: user._id });
  });

  it('should return the authenticated user', async () => {
    const res = await request(app)
      .get('/api/auth/user')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
    });
  });

  it('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/api/auth/user');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('No autorizado');
  });

  it('should return 500 if token is invalid', async () => {
    const res = await request(app)
      .get('/api/auth/user')
      .set('Authorization', `Bearer token-invalido`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Token no valido');
  });
});

describe('PUT /api/auth/profile', () => {
  let user: any;
  let token: string;

  beforeEach(async () => {
    // Limpio la base antes de cada test
    await User.deleteMany({});

    // Creo el usuario inicial
    user = new User({
      name: 'Original Name',
      email: 'original@example.com',
      password: 'hashed-password',
      confirmed: true,
    });
    await user.save();

    // Genero token con jsonwebtoken.sign usando la misma SECRET que el middleware
    token = jwt.generateJWT({ id: user._id }); // usa tu método personalizado
  });

  afterEach(async () => {
    // Limpio la base después de cada test
    await User.deleteMany({});
  });

  it('should update user profile', async () => {
    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Nuevo nombre',
        email: 'nuevo@nuevo.com',
      });

    expect(res.status).toBe(200);
    expect(res.text).toBe('Perfil actualizado correctamente');

    const updatedUser = await User.findById(user._id);
    expect(updatedUser?.name).toBe('Nuevo nombre');
    expect(updatedUser?.email).toBe('nuevo@nuevo.com');
  });

  it('should return 409 if email is already taken', async () => {
    // Creo otro usuario con el email que quiero probar que está duplicado
    const otherUser = new User({
      name: 'Other User',
      email: 'existing@example.com',
      password: 'hashed-password',
      confirmed: true,
    });
    await otherUser.save();

    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cualquier nombre',
        email: 'existing@example.com',
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Ese email ya esta registrado');
  });
});
 */