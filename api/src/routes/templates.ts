import { Hono } from 'hono'
import { supabaseAdmin } from '../lib/supabase'

const app = new Hono()

// List templates (public)
app.get('/', async (c) => {
  const industrySlug = c.req.query('industry')
  const category = c.req.query('category')
  const featured = c.req.query('featured') === 'true'

  let query = supabaseAdmin
    .from('templates')
    .select(`
      id, slug, name, short_description, description,
      category, tags, icon, estimated_setup_minutes,
      is_premium, is_featured, use_count, rating_average,
      industry:industries (id, slug, name, icon)
    `)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('use_count', { ascending: false })

  if (industrySlug) {
    // First get industry ID
    const { data: industry } = await supabaseAdmin
      .from('industries')
      .select('id')
      .eq('slug', industrySlug)
      .single()

    if (industry) {
      query = query.eq('industry_id', industry.id)
    }
  }

  if (category) {
    query = query.eq('category', category)
  }

  if (featured) {
    query = query.eq('is_featured', true)
  }

  const { data, error } = await query

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({ templates: data })
})

// Get template by slug (public)
app.get('/:slug', async (c) => {
  const slug = c.req.param('slug')

  const { data, error } = await supabaseAdmin
    .from('templates')
    .select(`
      *,
      industry:industries (id, slug, name, icon)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) {
    return c.json({ error: 'Template not found' }, 404)
  }

  return c.json({ template: data })
})

// Get industries list (public)
app.get('/meta/industries', async (c) => {
  const { data, error } = await supabaseAdmin
    .from('industries')
    .select('id, slug, name, icon, description')
    .eq('is_active', true)
    .order('sort_order')

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({ industries: data })
})

export default app
