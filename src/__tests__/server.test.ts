import request from 'supertest'
import app from '../server'

describe('GET /api', () => {
    it('debería responder con JSON msg: "Desde API"', async () => {
        const res = await request(app).get('/api')
        expect(res.status).toBe(200)
        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.body.msg).toBe('Desde API')
    })
})
