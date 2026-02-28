const baseUrl = 'http://localhost:3000/api';

async function runTests() {
    console.log('--- STARTING SERVICES TEST ---');

    // 1. Create a service
    const createServiceRes = await fetch(`${baseUrl}/services`, {
        method: 'POST',
        body: JSON.stringify({
            name: 'Test Service Alpha',
            slug: 'test-service-alpha',
            category: 'interior',
            description: 'A test service for soft deletes.',
            minPrice: 100,
            maxPrice: 200,
            minTimelineWeeks: 1,
            maxTimelineWeeks: 2,
            image: 'test-image.jpg'
        })
    });

    const newService = await createServiceRes.json();
    console.log('Created Service:', newService.id, newService.slug);

    // 2. Delete the service (Soft Delete)
    const delRes = await fetch(`${baseUrl}/services?id=${newService.id}`, { method: 'DELETE' });
    console.log('Deleted result:', await delRes.json());

    // 3. Create another service with FULL exact same slug (should succeed because the old one got renamed to -deleted-<timestamp>)
    const createServiceRes2 = await fetch(`${baseUrl}/services`, {
        method: 'POST',
        body: JSON.stringify({
            name: 'Test Service Alpha',
            slug: 'test-service-alpha',
            category: 'exterior',
            description: 'A second test service recreating the exact same slug!',
            minPrice: 300,
            maxPrice: 400,
            minTimelineWeeks: 2,
            maxTimelineWeeks: 4,
            image: 'test-image.jpg'
        })
    });

    const newService2 = await createServiceRes2.json();
    console.log('Created Same-Named Service After Delete:', newService2.id, newService2.slug);

    console.log('\n--- STARTING PROJECTS TEST ---');

    // 4. Create Project
    const createProjRes = await fetch(`${baseUrl}/projects`, {
        method: 'POST',
        body: JSON.stringify({
            title: 'Test Project Beta',
            clientName: 'Johnny Test',
            status: 'planning',
            startDate: new Date().toISOString(),
            content: 'Testing project logic.'
        })
    });
    const newProj = await createProjRes.json();
    console.log('Created Project:', newProj.id);

    // 5. Delete Project (Soft Delete)
    const delProjRes = await fetch(`${baseUrl}/projects?id=${newProj.id}`, { method: 'DELETE' });
    console.log('Deleted result:', await delProjRes.json());

    console.log('\n--- FETCHING ALL (Should not see deleted items) ---');

    const servicesList = await (await fetch(`${baseUrl}/services`)).json();
    console.log('Total services returned in GET:', servicesList.total);

    const projectsList = await (await fetch(`${baseUrl}/projects`)).json();
    console.log('Total projects returned in GET:', projectsList.total);
}

runTests().catch(console.error);
