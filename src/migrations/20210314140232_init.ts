import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (user) => {
    user.increments('id').primary()
    user.string('name', 255).notNullable()
    user.string('password', 1255).notNullable()
  })
  .createTable('refreshTokens', (token) => {
    token.increments('id').primary()
    token.string('token', 1255).notNullable()
  })
  .createTable('posts', (post) => {
    post.increments('id').primary()
    post.string('author', 255).notNullable()
    post.string('title', 255).notNullable()
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users')
}

