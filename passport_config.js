import LocalStrategy from 'passport-local'
import bcrypt from 'bcrypt'

export function initialize(passport, getUserByEmail, getUserById){
    //explin paramters
    //expalin function call
    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email)
        if (user == null){
            return done(null, false, {message: 'No user with that email'})
        }
        try {
            if (await bcrypt.compare(password, user.password)){
                return done(null, user)
            } else{
                return done(null, false, {message: 'Password incorrect'})
            }         
        } catch (e){
            return done(e)
        }
    }

    passport.use(new LocalStrategy({usernameField:'email', passwordField:'password'},authenticateUser))
    //To store inside of the session
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    })
}

